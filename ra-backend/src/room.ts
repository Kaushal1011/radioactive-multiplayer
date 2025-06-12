// src/RoomDO.ts
//--------------------------------------------------------------
//  RadioActive multiplayer room – Cloudflare Durable Object
//  Loads track CSV from KV, runs curvature‑aware physics loop
//--------------------------------------------------------------

import {
	Track,
	Player,
	buildTrackFromCSV,
	type Mode,
} from "./physics";
import { type ClientMsg, type ServerMsg } from "./types";
import { users, rooms } from './db/schema';
import { sql } from 'drizzle-orm';

import { drizzle } from 'drizzle-orm/d1';
// ---------------------------------------------
// Ticking constants
// ---------------------------------------------
const TICK_HZ = 30; // 30 ticks per second
const DT = 1 / TICK_HZ;

// ---------------------------------------------
// Internal room state
// ---------------------------------------------

interface Standing {
	id: string;
	lap: number;            // completed laps
	progress: number;       // metres into current lap
	totalDist: number;      // lap * trackLen + progress  (for sorting)
	finished: boolean;
}

interface RoomState {
	track: Track | null;
	players: Map<string, Player>;
	ready: Set<string>;
	sockets: Map<string, WebSocket>; // key → socket
	interval: number | null;
	trackName: string; // for debugging
	standings: Standing[];
	maxLaps: number;
}



export class RoomDO implements DurableObject {
	private env: Env;
	private room: RoomState;

	constructor(private state: DurableObjectState, env: Env) {
		this.env = env;
		this.room = {
			track: null,
			players: new Map(),
			ready: new Set(),
			sockets: new Map(),
			interval: null,
			trackName: '',
			standings: [],
			maxLaps: 30, // default max laps
		};
	}

	// -------------------------------------------------
	// WebSocket entry point
	// -------------------------------------------------
	async fetch(_req: Request): Promise<Response> {
		const [client, server] = Object.values(new WebSocketPair());
		server.accept();

		const url = new URL(_req.url);
		const pathnameParts = url.pathname.split('/');

		// Assuming URL is like /api/room/<roomId>/ws
		const roomId = pathnameParts[pathnameParts.length - 2]; // "abc123" in /api/room/abc123/ws

		console.log('Room ID in DO:', roomId);
		// fetch track name from kv
		const db = drizzle((this.env as any).RADIOACTIVE_DB);
		const room = await db.select().from(rooms).where(sql`${rooms.id} = ${roomId}`).get();

		if (room) {
			this.room.trackName = room.track;
			this.room.maxLaps = room.laps || 30; // default to 30 laps if not set
		}
		// Until we get the real playerId we store socket under temp guid
		const tempId = crypto.randomUUID();
		this.room.sockets.set(tempId, server);

		server.addEventListener("message", (evt) => this.onMessage(tempId, evt));
		server.addEventListener("close", () => {
			console.log("Socket closed:", tempId);
			this.onClose(tempId);
		});
		server.addEventListener("error", () => this.onClose(tempId));

		return new Response(null, { status: 101, webSocket: client });
	}

	// -------------------------------------------------
	// Message router
	// -------------------------------------------------
	private async onMessage(sockKey: string, evt: MessageEvent) {
		let msg: ClientMsg;
		try {
			msg = JSON.parse(evt.data as string);
		} catch {
			return; // ignore malformed
		}

		switch (msg.type) {
			// -----------------------------------------
			// Player joins a room; msg may include trackId
			// -----------------------------------------
			case "join": {
				const { playerId, trackId = "monza" } = msg as any;

				console.log("Player join:", playerId, "track:", trackId);

				// console.log("Current room state:", this.room);

				// Lazily load track from KV if not yet loaded
				await this.ensureTrack(this.room.trackName || trackId);

				const ws = this.room.sockets.get(sockKey)!;
				// Re‑associate socket with real playerId
				if (ws) {
					this.room.sockets.delete(sockKey);
					this.room.sockets.set(playerId, ws);
				}

				if (!this.room.players.has(playerId)) {
					const p = new Player();
					p.id = playerId;
					p.ws = ws;
					this.room.players.set(playerId, p);
				}

				// console.log(this.room);

				this.broadcastState();


				break;
			}

			case "ready": {
				console.log("Player ready:", msg.playerId);
				this.room.ready.add(msg.playerId);
				this.broadcastState();
				this.maybeStart();
				break;
			}

			case "input": {
				console.log("Player input:", msg.playerId, msg.input);
				const p = this.room.players.get(msg.playerId);
				if (p && msg.input) p.command(msg.input as Mode);
				break;
			}
		}
	}

	// -------------------------------------------------
	// Competitive physics loop
	// -------------------------------------------------
	private maybeStart() {
		console.log(this.room);
		console.log("maybeStart called");
		if (this.room.interval) return; // already running
		if (!this.room.track) return; // no map yet
		if (this.room.ready.size !== this.room.players.size || this.room.players.size === 0) return;


		let t = 3;
		const cd = setInterval(() => {
			this.broadcast({ type: "countdown", t } as ServerMsg);
			if (t-- === 0) {
				clearInterval(cd);
				this.room.interval = setInterval(() => this.tick(), DT * 1000);
			}
		}, 1_000);
	}

	private tick() {
		const track = this.room.track;
		if (!track) return;


		for (const pl of this.room.players.values()) {
			if (pl.finished) continue;     // skip cars that already took flag
			pl.step(track, DT);

			// ------------ lap counting ------------
			const newLap = Math.floor(pl.d / track.total);
			if (newLap > pl.lap) pl.lap = newLap;

			// ------------ chequered flag ------------
			if (pl.lap >= this.room.maxLaps) {
				pl.finished = true;
			}

		}

		// ------------ recompute standings ------------
		const arr: Standing[] = [];
		for (const pl of this.room.players.values()) {
			const progress = ((pl.d % track.total) + track.total) % track.total;
			arr.push({
				id: pl.id,
				lap: pl.lap,
				progress,
				totalDist: pl.lap * track.total + progress,
				finished: pl.finished,
			});
		}
		arr.sort((a, b) => b.totalDist - a.totalDist);
		this.room.standings = arr;

		// race done? stop timer
		if (arr.every(s => s.finished)) {
			if (this.room.interval) {
				clearInterval(this.room.interval);
				this.room.interval = null;
			}
		}

		this.broadcastState();
	}


	// -------------------------------------------------
	// Track loader – fetch CSV from KV only once
	// -------------------------------------------------
	private async ensureTrack(id: string) {
		if (this.room.track) return; // already loaded

		const csv = await (this.env as any).radioactive_namespace.get(id);
		if (!csv) throw new Error("track not found in KV");

		this.room.track = buildTrackFromCSV(csv);
	}

	// -------------------------------------------------
	// Socket cleanup
	// -------------------------------------------------
	private onClose(key: string) {
		this.room.sockets.delete(key);
		// Optionally drop player on disconnect
		const player = this.room.players.get(key);
		if (player) {
			this.room.players.delete(key);
			this.room.ready.delete(key);
		}
		if (this.room.players.size === 0) {
			// No players left, stop the physics loop
			if (this.room.interval) {
				clearInterval(this.room.interval);
				this.room.interval = null;
			}
		}
		this.broadcastState();
	}

	// -------------------------------------------------
	// Broadcast helpers
	// -------------------------------------------------
	private broadcastState() {
		const payload: ServerMsg = {
			type: "state",
			trackLoaded: !!this.room.track,
			players: Object.fromEntries(
				[...this.room.players.values()].map(p => [
					p.id,
					{ x: p.x, y: p.y, v: p.v, ers: p.ers, mode: p.mode }
				])
			),
			standings: this.room.standings,      // << NEW – already ordered
			maxLaps: this.room.maxLaps           // optional UI convenience
		};
		this.broadcast(payload);
	}

	private broadcast(msg: ServerMsg) {
		const raw = JSON.stringify(msg);
		for (const ws of this.room.sockets.values()) {
			if (ws.readyState === WebSocket.OPEN) ws.send(raw);
		}
	}
}
