import type { Mode } from './physics';

export type InputType = "RACE" | "ATTACK" | "DEPLOY" | "HARVEST" | "XMODE" | "ZMODE";

export type ClientMsg =
	| { type: "join"; playerId: string; }
	| { type: "ready"; playerId: string }
	| { type: "input"; playerId: string; input: InputType };

export type ServerMsg =
	| { type: "state"; players: Record<string, PlayerSnapshot>; trackLoaded: boolean; standings: Standing[]; maxLaps: number }
	| { type: "countdown"; t: number }

export interface PlayerSnapshot {
	x: number;
	y: number;
	v: number;        // current speed (m/s)
	ers: number;      // battery / ERS charge (0-100)
	mode: Mode;       // current driving mode
}

interface Standing {
	id: string;
	lap: number;            // completed laps
	progress: number;       // metres into current lap
	totalDist: number;      // lap * trackLen + progress  (for sorting)
	finished: boolean;
	finishedAt?: number | null; // timestamp when finished
}
