export type InputType = "BASE" | "PUSH" | "ERS" | "CONSERVE";

export type ClientMsg =
	| { type: "join"; playerId: string; }
	| { type: "ready"; playerId: string }
	| { type: "input"; playerId: string; input: InputType };

export type ServerMsg =
	| { type: "state"; players: Record<string, PlayerSnapshot>; trackLoaded: boolean }
	| { type: "countdown"; t: number }

export interface PlayerSnapshot {
	x: number;
	y: number;
}
