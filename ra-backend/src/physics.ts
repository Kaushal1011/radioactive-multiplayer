// src/physics.ts
//--------------------------------------------------------------
//  2026-inspired racing physics model for RadioActive
//
//  Highlights:
//  • New race modes inspired by 2026 F1 concepts (X/Z aero behavior).
//  • Battery deployment/harvest model with brake-zone regen only.
//  • Zone-aware speed profiles with deterministic server-side simulation.
//--------------------------------------------------------------

export const g = 9.81;

const ACCEL_RATE = 11;
const BRAKE_RATE = 34;
const MAX_SPEED = 95;
const MIN_SPEED = 6;

// Base speed profile
const STRAIGHT_VMAX = 93;
const CORNER_VMAX = 52;

// 2026-inspired battery model (displayed as 0-100%)
const BATTERY_CAPACITY = 100;
const DEPLOY_DRAIN = 18; // %/s
const ATTACK_DRAIN = 10; // %/s
const XMODE_DRAIN = 14; // %/s
const BRAKE_REGEN = 20; // %/s (only in corner/brake zones)
const HARVEST_REGEN = 32; // %/s in dedicated HARVEST mode and corners

// Mode tuning
const ATTACK_ACCEL_GAIN = 1.25;
const ATTACK_STRAIGHT_VMAX = 1.06;

const XMODE_STRAIGHT_VMAX = 1.12; // low drag
const XMODE_CORNER_VMAX = 0.9; // low downforce penalty
const XMODE_BRAKE_PENALTY = 0.9;

const HARVEST_ACCEL_SCALE = 0.82;
const HARVEST_VMAX_SCALE = 0.88;

const ZMODE_CORNER_VMAX = 1.1; // high downforce
const ZMODE_STRAIGHT_VMAX = 0.95;
const ZMODE_BRAKE_GAIN = 1.1;

const CURV_THRESH = 0.001;
const NARROW_WIDTH = 3.7;

export class Point {
	constructor(public x: number, public y: number, public w: number) { }
}

function curvature(a: Point, b: Point, c: Point) {
	const [x1, y1, x2, y2, x3, y3] = [a.x, a.y, b.x, b.y, c.x, c.y];
	const aLen = Math.hypot(x2 - x3, y2 - y3);
	const bLen = Math.hypot(x1 - x3, y1 - y3);
	const cLen = Math.hypot(x1 - x2, y1 - y2);
	const area = 0.5 * Math.abs(x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));
	return (4 * area) / (aLen * bLen * cLen);
}

export enum Zone {
	ACCEL,
	BRAKE,
}

export class Sector {
	zone: Zone;
	segLen: number;
	cumLen = 0;

	constructor(public p: Point, public curv: number, public width: number, dl: number) {
		this.segLen = dl;
		this.zone = Math.abs(curv) > CURV_THRESH || width < NARROW_WIDTH ? Zone.BRAKE : Zone.ACCEL;
	}
}

export class Track {
	sectors: Sector[] = [];
	total = 0;

	constructor(pts: Point[]) {
		for (let i = 1; i < pts.length - 1; i++) {
			const k = curvature(pts[i - 1], pts[i], pts[i + 1]);
			const dl = Math.hypot(pts[i].x - pts[i + 1].x, pts[i].y - pts[i + 1].y);
			this.sectors.push(new Sector(pts[i], k, pts[i].w, dl));
		}
		for (const sec of this.sectors) {
			sec.cumLen = this.total;
			this.total += sec.segLen;
		}
	}

	private sectorIndex(m: number) {
		const d = ((m % this.total) + this.total) % this.total;
		let i = this.sectors.length - 1;
		while (i >= 0 && d < this.sectors[i].cumLen) i--;
		return i;
	}

	sectorAt(m: number) {
		return this.sectors[this.sectorIndex(m)];
	}
}

export function buildTrackFromCSV(csv: string) {
	const pts = csv
		.trim()
		.split(/\n+/)
		.filter((l) => l && !l.startsWith('#'))
		.map((r) => {
			const [x, y, wr, wl] = r.split(',').map(Number);
			return new Point(x, y, (wr + wl) / 2);
		});
	return new Track(pts);
}

export type Mode = 'RACE' | 'ATTACK' | 'DEPLOY' | 'HARVEST' | 'XMODE' | 'ZMODE';

export class Player {
	id = '';
	ws: WebSocket | null = null;
	d = 0;
	v = 0;
	x = 0;
	y = 0;
	lap = 0;
	finished = false;
	finishedAt: number | null = null;

	battery = BATTERY_CAPACITY;
	mode: Mode = 'RACE';

	command(m: Mode) {
		this.mode = m;
	}

	step(track: Track, dt: number) {
		const sec = track.sectorAt(this.d);
		const inCorner = sec.zone === Zone.BRAKE;

		let vmax = inCorner ? CORNER_VMAX : STRAIGHT_VMAX;
		let accel = ACCEL_RATE;
		let brake = BRAKE_RATE;
		let batteryDrain = 0;
		let batteryGain = 0;

		switch (this.mode) {
			case 'ATTACK':
				accel *= ATTACK_ACCEL_GAIN;
				if (!inCorner) vmax *= ATTACK_STRAIGHT_VMAX;
				batteryDrain += ATTACK_DRAIN;
				break;
			case 'DEPLOY':
				accel *= 1.45;
				vmax *= 1.08;
				batteryDrain += DEPLOY_DRAIN;
				break;
			case 'HARVEST':
				accel *= HARVEST_ACCEL_SCALE;
				vmax *= HARVEST_VMAX_SCALE;
				if (inCorner) batteryGain += HARVEST_REGEN;
				break;
			case 'XMODE':
				if (inCorner) {
					vmax *= XMODE_CORNER_VMAX;
					brake *= XMODE_BRAKE_PENALTY;
				} else {
					vmax *= XMODE_STRAIGHT_VMAX;
				}
				batteryDrain += XMODE_DRAIN;
				break;
			case 'ZMODE':
				if (inCorner) {
					vmax *= ZMODE_CORNER_VMAX;
					brake *= ZMODE_BRAKE_GAIN;
				} else {
					vmax *= ZMODE_STRAIGHT_VMAX;
				}
				break;
			case 'RACE':
			default:
				break;
		}

		// Automatic regen only in corner/brake zones (no MGU-H style always-on harvest)
		if (inCorner) {
			batteryGain += BRAKE_REGEN;
		}

		if (batteryDrain > 0) {
			if (this.battery <= 0) {
				this.mode = 'RACE';
				batteryDrain = 0;
			} else {
				this.battery = Math.max(0, this.battery - batteryDrain * dt);
			}
		}

		if (batteryGain > 0) {
			this.battery = Math.min(BATTERY_CAPACITY, this.battery + batteryGain * dt);
		}

		vmax = Math.min(MAX_SPEED, Math.max(MIN_SPEED, vmax));

		if (!inCorner) {
			if (this.v < vmax) this.v = Math.min(vmax, this.v + accel * dt);
			else if (this.v > vmax) this.v = Math.max(vmax, this.v - brake * dt);
		} else {
			if (this.v > vmax) this.v = Math.max(vmax, this.v - brake * dt);
			else if (this.v < vmax) this.v = Math.min(vmax, this.v + accel * dt * 0.24);
		}

		this.d += this.v * dt;
		const secNew = track.sectorAt(this.d);
		this.x = secNew.p.x;
		this.y = secNew.p.y;
	}

	snapshot() {
		return { x: this.x, y: this.y, v: this.v, ers: this.battery, mode: this.mode };
	}
}
