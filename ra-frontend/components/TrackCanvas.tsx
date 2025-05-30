'use client';
import { useEffect, useRef } from 'react';
import { useTrackPoints } from '@/hooks/useTrackPoints';
import type { PlayerSnapshot } from '@/hooks/useRaceSocket';

type Pos = { x: number; y: number; color?: string };

interface Props {
	track: string; // "monza" | "monaco" | ...
	cars?: Record<string, PlayerSnapshot>; // your WS object
	positions?: Pos[]; // alt light-weight list
}

export default function TrackCanvas({ track, cars, positions }: Props) {
	const ref = useRef<HTMLCanvasElement>(null);
	const { pts: trackPts } = useTrackPoints(track);

	/* ----------------------------------------------------------
     Helpers
  ---------------------------------------------------------- */
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

	/* ----------------------------------------------------------
     Draw static track once we have the points
  ---------------------------------------------------------- */
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

	/* ----------------------------------------------------------
     Draw cars / dots whenever they change
  ---------------------------------------------------------- */
	useEffect(() => {
		if (!trackPts.length) return; // wait until track is painted

		const c = ref.current;
		if (!c) return;
		const ctx = c.getContext('2d')!;
		const { width: w, height: h } = c;

		// wipe only the dynamic layer
		ctx.clearRect(0, 0, w, h);

		// redraw track quickly (cheap)
		ctx.lineWidth = 4;
		ctx.strokeStyle = '#e5e7eb';
		ctx.beginPath();
		trackPts.forEach(([x, y], i) => {
			const [px, py] = scale(x, y, w, h);
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
		});
		ctx.stroke();

		/* choose one source of positions */
		const dots: Pos[] = positions ? positions : cars ? Object.values(cars) : [];

		dots.forEach((p) => {
			const [cx, cy] = scale(p.x, p.y, w, h);
			ctx.fillStyle = p.color ?? '#f87171';
			ctx.beginPath();
			ctx.arc(cx, cy, 16, 0, Math.PI * 2);
			ctx.fill();
			ctx.lineWidth = 2;
			ctx.strokeStyle = '#000';
			ctx.stroke();
		});
	}, [cars, positions, trackPts]);

	return <canvas ref={ref} className="h-full w-full rounded bg-neutral-900/40" width={1500} height={625} />;
}
