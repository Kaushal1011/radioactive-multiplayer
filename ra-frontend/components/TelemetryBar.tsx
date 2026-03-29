'use client';

import type { PlayerSnapshot } from '@/hooks/useRaceSocket';
import clsx from 'clsx';

const modeTint: Record<string, string> = {
	RACE: 'bg-slate-600/60',
	ATTACK: 'bg-orange-500/70',
	DEPLOY: 'bg-pink-500/70',
	HARVEST: 'bg-emerald-600/70',
	XMODE: 'bg-cyan-500/70',
	ZMODE: 'bg-indigo-500/70',
};

export default function TelemetryBar({ car }: { car?: PlayerSnapshot | '' }) {
	const speedKmh = car ? Math.round((car.v * 3600) / 1000) : 0;
	const battery = car ? Math.max(0, Math.min(100, Math.round(car.ers))) : 0;
	const mode = car ? car.mode : '--';

	return (
		<div className="grid grid-cols-1 gap-3 rounded-xl border border-neutral-700 bg-neutral-900/80 p-4 text-white md:grid-cols-3">
			<div>
				<p className="text-xs uppercase tracking-widest text-white/60">Speed</p>
				<p className="text-2xl font-bold tabular-nums">{car ? `${speedKmh} km/h` : '--'}</p>
			</div>

			<div>
				<div className="flex items-end justify-between">
					<p className="text-xs uppercase tracking-widest text-white/60">Energy Store</p>
					<p className="text-lg font-semibold tabular-nums">{car ? `${battery}%` : '--'}</p>
				</div>
				<div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
					<div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500" style={{ width: `${battery}%` }} />
				</div>
			</div>

			<div>
				<p className="text-xs uppercase tracking-widest text-white/60">Aero / Power Mode</p>
				<div className={clsx('mt-1 inline-block rounded-md px-3 py-1 text-sm font-semibold', modeTint[mode] ?? 'bg-white/10')}>
					{mode}
				</div>
			</div>
		</div>
	);
}
