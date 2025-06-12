// src/physics.ts
//--------------------------------------------------------------
//  Simplified racing physics with GAME MODES – v9
//  (29 May 2025)
//
//  • Track is pre‑classified into fixed ACCEL / BRAKE zones at load‑time.
//  • BASE / PUSH / ERS / CONSERVE modes restored (no curvature look‑ahead).
//  • Constant, deterministic behaviour lap‑after‑lap.
//--------------------------------------------------------------

/* ---------- constants ---------- */
export const g = 9.81;                      // gravity (m s⁻²) – reserved for future grip calcs

const ACCEL_RATE = 10;                      // m s⁻² constant propulsion
const BRAKE_RATE = 30;                      // m s⁻² constant braking
const MAX_SPEED = 90;                      // m s⁻¹  ≈ 324 km h⁻¹
const MIN_SPEED = 5;                       // m s⁻¹  stall‑avoid
const BRAKE_ZONE_VMAX = 45;                 // m s⁻¹  (≈ 162 km h⁻¹) speed cap in BRAKE zones

// Energy‑recovery system (ERS)
const ERS_CAP = 4000;                     // J (full charge)
const ERS_DRAIN = 120;                      // J s⁻¹ while ERS active
const ERS_REGEN = 35;                       // J s⁻¹ while coasting (CONSERVE)

// PUSH mode modifiers
const PUSH_VMAX_STRAIGHT = 1.10;            // +10 % in ACCEL zones
const PUSH_VMAX_BRAKE = 0.90;            // −10 % in BRAKE zones
const PUSH_ACCEL_GAIN = 1.30;            // +30 % propulsion

// Track classification thresholds
const CURV_THRESH = 0.001;                  // |κ| ≤ 5×10⁻2 m⁻¹ ⇒ straight
const NARROW_WIDTH = 3.7;                   // anything narrower ⇒ BRAKE zone

/* ---------- helpers ---------- */
export class Point {
	constructor(public x: number, public y: number, public w: number) { }
}

// Signed curvature for local triplet (used once at load‑time)
function curvature(a: Point, b: Point, c: Point) {
	const [x1, y1, x2, y2, x3, y3] = [a.x, a.y, b.x, b.y, c.x, c.y];
	const aLen = Math.hypot(x2 - x3, y2 - y3);
	const bLen = Math.hypot(x1 - x3, y1 - y3);
	const cLen = Math.hypot(x1 - x2, y1 - y2);
	const area = 0.5 * Math.abs(
		x1 * (y2 - y3) +
		x2 * (y3 - y1) +
		x3 * (y1 - y2)
	);
	return (4 * area) / (aLen * bLen * cLen);   // signed κ – magnitude only later
}

/* ---------- track & sectors ---------- */
export enum Zone { ACCEL, BRAKE }

export class Sector {
	zone: Zone;          // predetermined driving behaviour
	segLen: number;      // length of this segment (m)
	cumLen = 0;          // distance from start‑line to segment start (m)

	constructor(public p: Point, public curv: number, public width: number, dl: number) {
		this.segLen = dl;
		// Decide zone once – fixed for every lap
		this.zone = (Math.abs(curv) > CURV_THRESH || width < NARROW_WIDTH)
			? Zone.BRAKE
			: Zone.ACCEL;
	}
}

export class Track {
	sectors: Sector[] = [];
	total = 0; // full lap length (m)

	constructor(pts: Point[]) {
		// Build sectors from adjacent triplets
		for (let i = 1; i < pts.length - 1; i++) {
			const k = curvature(pts[i - 1], pts[i], pts[i + 1]);
			const dl = Math.hypot(pts[i].x - pts[i + 1].x, pts[i].y - pts[i + 1].y);
			this.sectors.push(new Sector(pts[i], k, pts[i].w, dl));
		}
		// Prefix‑sum cumulative distance
		for (const sec of this.sectors) {
			sec.cumLen = this.total;
			this.total += sec.segLen;
		}
	}

	/** Internal: sector index at distance *m* along centre‑line (wraps). */
	private sectorIndex(m: number) {
		const d = ((m % this.total) + this.total) % this.total;
		let i = this.sectors.length - 1;
		while (i >= 0 && d < this.sectors[i].cumLen) i--;
		return i;
	}
	sectorAt(m: number) { return this.sectors[this.sectorIndex(m)]; }
}

/* ---------- CSV loader ---------- */
export function buildTrackFromCSV(csv: string) {
	const pts = csv.trim()
		.split(/\n+/)
		.filter(l => l && !l.startsWith('#'))
		.map(r => {
			const [x, y, wr, wl] = r.split(',').map(Number);
			return new Point(x, y, (wr + wl) / 2);
		});
	return new Track(pts);
}

/* ---------- player (single‑car) ---------- */
export type Mode = 'BASE' | 'PUSH' | 'ERS' | 'CONSERVE';

export class Player {
	id = '';
	ws: WebSocket | null = null;
	d = 0; v = 0; x = 0; y = 0;
	lap = 0;                 // completed full laps
	finished = false;
	// Position & kinematics
	// Game state

	ers = ERS_CAP;
	mode: Mode = 'BASE';

	command(m: Mode) { this.mode = m; }

	/** Advance the car by *dt* seconds on *track*. */
	step(track: Track, dt: number) {
		const sec = track.sectorAt(this.d);

		/* ---- base parameters (zone‑dependent) ---- */
		let vmax = (sec.zone === Zone.ACCEL) ? MAX_SPEED : BRAKE_ZONE_VMAX;
		let accel = ACCEL_RATE;
		let brake = BRAKE_RATE;

		/* ---- mode modifiers ---- */
		switch (this.mode) {
			case 'PUSH':
				vmax *= (sec.zone === Zone.ACCEL) ? PUSH_VMAX_STRAIGHT : PUSH_VMAX_BRAKE;
				accel *= PUSH_ACCEL_GAIN;
				break;

			case 'ERS':
				if (this.ers > 0) {
					vmax *= 1.15;
					accel *= 1.90;
					this.ers = Math.max(0, this.ers - ERS_DRAIN * dt);
				} else {
					this.mode = 'BASE';
				}
				break;

			case 'CONSERVE':
				vmax *= 0.90;
				accel *= 0.60;
				brake *= 0.80;
				this.ers = Math.min(ERS_CAP, this.ers + ERS_REGEN * dt);
				break;
		}

		// Clamp speed limits
		vmax = Math.min(MAX_SPEED, Math.max(MIN_SPEED, vmax));

		/* ---- speed limits ---- for modes calc */
		switch (this.mode) {
			case 'BASE':
				vmax = vmax; // no change
				break;
			case 'PUSH':
				vmax = (sec.zone === Zone.ACCEL) ? vmax * PUSH_VMAX_STRAIGHT : vmax * PUSH_VMAX_BRAKE;
				break;
			case 'CONSERVE':
				vmax *= 0.90; // 10% slower
				break;
		}
		/* ---- simple accel / brake rules ---- */
		if (sec.zone === Zone.ACCEL) {
			if (this.v < vmax) this.v = Math.min(vmax, this.v + accel * dt);
			else if (this.v > vmax) this.v = Math.max(vmax, this.v - brake * dt);
		} else { // BRAKE zone
			if (this.v > vmax) this.v = Math.max(vmax, this.v - brake * dt);
			else if (this.v < vmax) this.v = Math.min(vmax, this.v + accel * dt * 0.25); // minor throttle to keep pace
		}

		/* ---- advance distance & cartesian coords ---- */
		this.d += this.v * dt;
		const secNew = track.sectorAt(this.d);
		// console.log(Math.abs(secNew.curv));
		this.x = secNew.p.x;
		this.y = secNew.p.y;
	}

	snapshot() {
		return { x: this.x, y: this.y, v: this.v, ers: this.ers, mode: this.mode };
	}
}
