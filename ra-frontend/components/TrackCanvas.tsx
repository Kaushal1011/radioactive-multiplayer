'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
	BASE: { stroke: '#0f172a', width: 2 }, // slate-900
	PUSH: { stroke: '#f97316', width: 4 }, // orange-500
	ERS: { stroke: '#38bdf8', width: 5 }, // sky-400
	CONSERVE: { stroke: '#4ade80', width: 3 }, // green-400
};

export default function TrackCanvas({ track, cars, positions }: Props) {
        const ref = useRef<HTMLCanvasElement>(null);
        const carImg = useRef<HTMLImageElement | null>(null);
        const [carReady, setCarReady] = useState(false);
        const { pts: trackPts } = useTrackPoints(track);

	/* ---------------- helpers ---------------- */
        const bounds = useMemo(() => {
                const xs = trackPts.map((p) => p[0]);
                const ys = trackPts.map((p) => p[1]);
                return {
                        minX: Math.min(...xs),
                        maxX: Math.max(...xs),
                        minY: Math.min(...ys),
                        maxY: Math.max(...ys),
                };
        }, [trackPts]);
        const scale = useCallback((x: number, y: number, w: number, h: number) => {
                const nx = ((x - bounds.minX) / (bounds.maxX - bounds.minX)) * w;
                const ny = h - ((y - bounds.minY) / (bounds.maxY - bounds.minY)) * h;
                return [nx, ny];
        }, [bounds]);

        /* ---------------- load assets ---------------- */
        useEffect(() => {
                const img = new Image();
                img.src = '/f1-car.svg';
                img.onload = () => {
                        carImg.current = img;
                        setCarReady(true);
                };
        }, []);

        const drawTrack = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
                ctx.clearRect(0, 0, w, h);
                ctx.fillStyle = '#14532d'; // grass
                ctx.fillRect(0, 0, w, h);

                const path = new Path2D();
                trackPts.forEach(([x, y], i) => {
                        const [px, py] = scale(x, y, w, h);
                        if (i === 0) path.moveTo(px, py);
                        else path.lineTo(px, py);
                });

                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                // white edges then grey road
                ctx.strokeStyle = '#f4f4f5';
                ctx.lineWidth = 34;
                ctx.stroke(path);

                ctx.strokeStyle = '#6b7280';
                ctx.lineWidth = 26;
                ctx.stroke(path);
        }, [trackPts, scale]);

        /* ---------------- paint STATIC track ---------------- */
        useEffect(() => {
                if (!trackPts.length) return;
                const c = ref.current;
                if (!c) return;
                const ctx = c.getContext('2d')!;
                const { width: w, height: h } = c;

                drawTrack(ctx, w, h);
        }, [trackPts, drawTrack]);

	/* ---------------- paint DYNAMIC cars ---------------- */
	useEffect(() => {
		if (!trackPts.length) return;
		const c = ref.current;
		if (!c) return;
		const ctx = c.getContext('2d')!;
		const { width: w, height: h } = c;

                drawTrack(ctx, w, h);

                /* decide the source of dots */
                const dots: Pos[] = positions ? positions : cars ? Object.values(cars) : [];

                dots.forEach((p) => {
                        const [cx, cy] = scale(p.x, p.y, w, h);
                        // colour ring behind sprite
                        ctx.fillStyle = p.color ?? '#f87171';
                        ctx.beginPath();
                        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
                        ctx.fill();

                        if (carReady && carImg.current) {
                                ctx.drawImage(carImg.current, cx - 12, cy - 12, 24, 24);
                        }

                        // outer ring – mode indicator
                        const mode = p.mode ?? 'BASE';
                        const { stroke, width } = MODE_STYLE[mode];
                        ctx.lineWidth = width;
                        ctx.strokeStyle = stroke;
                        ctx.beginPath();
                        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
                        ctx.stroke();
                });
        }, [cars, positions, trackPts, carReady, drawTrack, scale]);

	return <canvas ref={ref} className="h-full w-full rounded bg-neutral-900/40" width={1500} height={625} />;
}
