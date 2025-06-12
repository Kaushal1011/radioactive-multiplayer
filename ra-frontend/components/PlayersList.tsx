'use client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Gauge, BatteryCharging } from 'lucide-react';
import clsx from 'clsx';
import type { PlayerSnapshot, Standings } from '@/hooks/useRaceSocket';

interface Props {
	/** Map of playerId -> car snapshot coming from the WS */
	cars: Record<string, PlayerSnapshot>;
	/** Leaderboard data already sorted server‑side (can be empty before start). */
	standings?: Standings[];
	/** Current user id – used to highlight "You" and the row background. */
	meId?: string;
	/** Max laps for the race (optional, purely cosmetic). */
	maxLaps?: number;
}

/**
 * Compact but expressive leaderboard styled after modern racing titles.
 * Shows position, speed, ERS %, lap counter and a lap‑progress bar.
 */
export default function PlayersList({ cars, standings = [], meId, maxLaps }: Props) {
	// Respect leaderboard order, fallback to alphabetical list of drivers.
	const orderedIds = standings.length ? standings.map((s) => s.id) : Object.keys(cars).sort();

	return (
		<Card className="h-full overflow-y-auto border border-neutral-800 bg-neutral-900/50 backdrop-blur-md">
			<CardHeader className="pb-2 text-lg font-semibold">Drivers</CardHeader>
			<CardContent className="flex flex-col gap-3 py-2">
				{orderedIds.length === 0 && <p className="text-sm text-muted-foreground">Waiting…</p>}

				{orderedIds.map((id, idx) => {
					const car = cars[id];
					const standing = standings.find((s) => s.id === id);

					// progress within the current lap (0‑100%)
					const lapProgressPct = standing ? ((standing.progress % standing.totalDist) / standing.totalDist) * 100 : 0;

					return (
						<div
							key={id}
							className={clsx(
								'rounded-lg p-2 transition-colors',
								meId === id ? 'bg-gradient-to-r from-indigo-600/20 to-transparent' : 'hover:bg-neutral-800/50'
							)}
						>
							{/* ── Top row ───────────────────────────────────── */}
							<div className="flex items-center justify-between gap-1">
								{/* Position & driver */}
								<div className="flex items-center gap-1 min-w-0">
									<span className="w-5 text-right text-xs font-bold tabular-nums">{idx + 1}</span>
									<span
										style={car?.color ? { backgroundColor: car.color } : {}}
										className={clsx('h-3 w-3 rounded-full', car?.color ? '' : 'bg-gray-500')}
									/>
									<span className="truncate text-sm font-medium">
										{meId === id ? 'You' : `${id.slice(0, 2)}…${id.slice(-3)}`}
									</span>
								</div>

								{/* Live telemetry */}
								<div className="flex items-center gap-1 text-xs text-muted-foreground">
									{/* Speed */}
									<span className="flex items-center gap-1 tabular-nums">
										<Gauge className="h-3 w-3" />
										{car?.v ? `${Math.round((car.v * 3600) / 1000)} km/h` : '--'}
									</span>

									{/* ERS */}
									{typeof car?.ers === 'number' && (
										<span className="flex items-center gap-1 tabular-nums">
											<BatteryCharging className="h-3 w-3" />
											{Math.round(car.ers)}%
										</span>
									)}

									{/* Lap counter */}
									{standing && (
										<span className="tabular-nums">
											Lap {standing.lap}/{maxLaps ?? '--'}
										</span>
									)}
								</div>
							</div>

							{/* ── Lap progress bar ─────────────────────────── */}
							{standing && (
								<div className="mt-2">
									<div className="relative h-1.5 w-full overflow-hidden rounded bg-neutral-700">
										<div
											style={{ width: `${lapProgressPct}%`, backgroundColor: car?.color ?? '#22d3ee' }}
											className="absolute left-0 top-0 h-full rounded"
										/>
									</div>
								</div>
							)}
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
