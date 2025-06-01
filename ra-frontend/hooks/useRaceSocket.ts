"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type InputType = "BASE" | "PUSH" | "ERS" | "CONSERVE";

export type ClientMsg =
	| { type: "join"; playerId: string; }
	| { type: "ready"; playerId: string }
	| { type: "input"; playerId: string; input: InputType };

export type ServerMsg =
	| { type: "state"; players: Record<string, PlayerSnapshot>; trackLoaded: boolean }
	| { type: "countdown"; t: number }

export interface PlayerSnapshot {
	color: any;
	x: number;
	y: number;
	v: number;
	ers: number; // energy recovery system (ERS) charge
	mode: InputType; // current driving mode
}

function djb2(str: string) {
	let h = 5381;
	for (let i = 0; i < str.length; i++) {
		h = (h * 33) ^ str.charCodeAt(i);
	}
	return h >>> 0;              // force unsigned
}

function colorFromId(id: string) {
	const hue = djb2(id) % 360;  // deterministic 0-359
	return `hsl(${hue} 80% 60%)`;
}

/* ---------- util ---------- */
const randColor = () => `hsl(${Math.floor(Math.random() * 360)} 80% 60%)`;

/* ------------------------------------------------------------------
   useRaceSocket – the simplest possible WebSocket hook
------------------------------------------------------------------- */
export function useRaceSocket(roomId: string, countdownFunc?: (t: number) => void) {
	const [cars, setCars] = useState<Record<string, PlayerSnapshot>>({});
	const [ready, setReady] = useState(false);

	const wsRef = useRef<WebSocket | null>(null);

	/* open / close when roomId changes -------------------------------- */
	useEffect(() => {
		console.log("useRaceSocket: roomId changed to", roomId);
		if (!roomId) return;

		const url = `${process.env.NEXT_PUBLIC_API_URL}/api/room/${roomId}/ws`;
		console.log("Connecting to WebSocket:", url);
		const ws = new WebSocket(url);
		wsRef.current = ws;

		ws.onopen = () => setReady(true);
		ws.onclose = ws.onerror = () => {
			setReady(false);
			wsRef.current = null;
		};

		ws.onmessage = (ev) => {
			try {
				const msg = JSON.parse(ev.data) as ServerMsg;

				switch (msg.type) {
					case "state":
						// update cars state
						//  add a random color for visualization
						Object.entries(msg.players).forEach(([id, player]) => {
							if (!player.color) {
								player.color = colorFromId(id); // assign random color if not set
							}
						});
						setCars(msg.players);
						break;

					case "countdown":
						// handle countdown if needed
						console.log("Countdown:", msg.t);
						if (countdownFunc) {
							countdownFunc(msg.t);
						}
						break;

					default:
						console.warn("Unknown message type:", msg);
				}



			} catch {
				/* ignore malformed JSON */
			}
		};

		/* clean up on unmount or room change */
		return () => {
			ws.close();
			wsRef.current = null;
			setReady(false);
		};
	}, [roomId]);

	/* send helper ----------------------------------------------------- */
	const send = useCallback((payload: unknown) => {
		if (wsRef.current?.readyState === WebSocket.OPEN) {
			wsRef.current.send(JSON.stringify(payload));
		}
	}, []);

	return { cars, ready, send };
}
