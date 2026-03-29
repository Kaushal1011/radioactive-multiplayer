'use client';
import { useEffect, useRef } from 'react';
import { useTrackPoints } from '@/hooks/useTrackPoints';
import type { InputType } from '@/hooks/useRaceSocket';
import type { PlayerSnapshot } from '@/hooks/useRaceSocket';

/* ------------------------------------------------------------
   Types
------------------------------------------------------------ */
type Pos = {
	x: number;
	y: number;
	color?: string;
	mode?: InputType; // NEW – for lightweight <positions> fallback
};

interface Props {
	track: string;
	cars?: Record<string, PlayerSnapshot>; // live WS state
	positions?: Pos[]; // optional lightweight list
}

/* ------------------------------------------------------------
   Per-mode look-up table
------------------------------------------------------------ */
const MODE_STYLE: Record<InputType, { stroke: string; width: number }> = {
	RACE: { stroke: '#64748b', width: 2 },
	ATTACK: { stroke: '#f97316', width: 4 },
	DEPLOY: { stroke: '#ec4899', width: 5 },
	HARVEST: { stroke: '#22c55e', width: 3 },
	XMODE: { stroke: '#06b6d4', width: 5 },
	ZMODE: { stroke: '#6366f1', width: 4 },
};

export default function TrackCanvas({ track, cars, positions }: Props) {
	const ref = useRef<HTMLCanvasElement>(null);
	const { pts: trackPts } = useTrackPoints(track);

	/* ---------------- helpers ---------------- */
	const bounds = (() => {
		const xs = trackPts.map((p) => p[0]);
		const ys = trackPts.map((p) => p[1]);
		return {
			minX: Math.min(...xs),
			maxX: Math.max(...xs),
			minY: Math.min(...ys),
			maxY: Math.max(...ys),
		};
	})();
	const scale = (x: number, y: number, w: number, h: number) => {
		const nx = ((x - bounds.minX) / (bounds.maxX - bounds.minX)) * w;
		const ny = h - ((y - bounds.minY) / (bounds.maxY - bounds.minY)) * h;
		return [nx, ny];
	};

	/* ---------------- paint STATIC track ---------------- */
	useEffect(() => {
		if (!trackPts.length) return;
		const c = ref.current;
		if (!c) return;
		const ctx = c.getContext('2d')!;
		const { width: w, height: h } = c;

		ctx.clearRect(0, 0, w, h);
		ctx.lineWidth = 4;
		ctx.lineCap = 'round';
		ctx.strokeStyle = '#e5e7eb';

		ctx.beginPath();
		trackPts.forEach(([x, y], i) => {
			const [px, py] = scale(x, y, w, h);
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
		});
		ctx.stroke();
	}, [trackPts]);

	/* ---------------- paint DYNAMIC cars ---------------- */
	useEffect(() => {
		if (!trackPts.length) return;
		const c = ref.current;
		if (!c) return;
		const ctx = c.getContext('2d')!;
		const { width: w, height: h } = c;

		/* clear ONLY the dynamic layer */
		ctx.clearRect(0, 0, w, h);

		/* quick redraw of grey track */
		ctx.lineWidth = 4;
		ctx.strokeStyle = '#e5e7eb';
		ctx.beginPath();
		trackPts.forEach(([x, y], i) => {
			const [px, py] = scale(x, y, w, h);
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
		});
		ctx.stroke();

		/* decide the source of dots */
		const dots: Pos[] = positions ? positions : cars ? Object.values(cars) : [];

		dots.forEach((p) => {
			const [cx, cy] = scale(p.x, p.y, w, h);

			// inner solid circle (driver colour)
			ctx.fillStyle = p.color ?? '#f87171';
			ctx.beginPath();
			ctx.arc(cx, cy, 14, 0, Math.PI * 2);
			ctx.fill();

			// outer ring – mode indicator
			const mode = p.mode ?? 'RACE';
			const { stroke, width } = MODE_STYLE[mode];
			ctx.lineWidth = width;
			ctx.strokeStyle = stroke;
			ctx.beginPath();
			ctx.arc(cx, cy, 16, 0, Math.PI * 2);
			ctx.stroke();
		});
	}, [cars, positions, trackPts]);

	return <canvas ref={ref} className="h-full w-full rounded-xl border border-neutral-700 bg-gradient-to-b from-neutral-950 to-neutral-900" width={1500} height={625} />;
}
