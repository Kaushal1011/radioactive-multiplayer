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

// ---------------------------------------------
// Ticking constants
// ---------------------------------------------
const TICK_HZ = 10;
const DT = 1 / TICK_HZ;

// ---------------------------------------------
// Internal room state
// ---------------------------------------------
interface RoomState {
	track: Track | null;
	players: Map<string, Player>;
	ready: Set<string>;
	sockets: Map<string, WebSocket>; // key → socket
	interval: number | null;
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
		};
	}

	// -------------------------------------------------
	// WebSocket entry point
	// -------------------------------------------------
	async fetch(_req: Request): Promise<Response> {
		const [client, server] = Object.values(new WebSocketPair());
		server.accept();
		await this.ensureTrack('monza');
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
				const { playerId, trackId = "default" } = msg as any;

				// Lazily load track from KV if not yet loaded


				const ws = this.room.sockets.get(sockKey)!;
				// Re‑associate socket with real playerId
				this.room.sockets.delete(sockKey);
				this.room.sockets.set(playerId, ws);

				if (!this.room.players.has(playerId)) {
					const p = new Player();
					p.id = playerId;
					p.ws = ws;
					this.room.players.set(playerId, p);
				} else {
					// Reconnect: just patch socket reference
					this.room.players.get(playerId)!.ws = ws;
				}

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
		// console.log(this.room);
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
			pl.step(track, DT);
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
				[...this.room.players.values()].map((p) => [
					p.id,
					{ x: p.x, y: p.y, v: p.v, ers: p.ers, mode: p.mode },
				])
			),
		} as ServerMsg;

		this.broadcast(payload);
	}

	private broadcast(msg: ServerMsg) {
		const raw = JSON.stringify(msg);
		for (const ws of this.room.sockets.values()) {
			if (ws.readyState === WebSocket.OPEN) ws.send(raw);
		}
	}
}
