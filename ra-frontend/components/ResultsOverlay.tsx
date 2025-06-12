'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import type { Standings } from '@/hooks/useRaceSocket';
import { useAuth } from '@clerk/nextjs';
import { Trophy } from 'lucide-react';

interface Props {
	open: boolean;
	standings: Standings[];
	onClose: () => void;
}

/**
 * Full-screen modal leaderboard shown when all racers have finished.
 */
export default function ResultsOverlay({ open, standings, onClose }: Props) {
	const { userId } = useAuth();

	/* ---------- order by performance ---------- */
	const sorted = [...standings].sort((a, b) => (a.lap !== b.lap ? b.lap - a.lap : b.progress - a.progress));
	const winner = sorted[0];

	/* ---------- row helpers ---------- */
	const rowTint = (pos: number) => {
		switch (pos) {
			case 1:
				return 'bg-yellow-400/25';
			case 2:
				return 'bg-gray-300/20';
			case 3:
				return 'bg-amber-700/25';
			default:
				return 'bg-neutral-800/60';
		}
	};

	if (!open) {
		return null; // don't render anything if not open
	}

	return (
		<Dialog open={open} onOpenChange={(o) => !o && onClose()}>
			<DialogContent
				/* hide shadcn’s built-in close btn */
				className="
          max-w-md border-neutral-700
          bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900/90
          text-white shadow-2xl backdrop-blur
          [&_[data-radix-dialog-close]]:hidden
        "
			>
				{/* --- header with trophy -------------------------------- */}
				<DialogHeader className="items-center gap-2 pb-4">
					<Trophy className="h-9 w-9 animate-bounce text-yellow-400" />
					<DialogTitle className="text-center text-3xl font-extrabold">Race&nbsp;Finished!</DialogTitle>
				</DialogHeader>

				{/* --- winner callout ------------------------------------ */}
				<p className="mb-4 text-center text-lg">
					Winner:&nbsp;
					<span className="font-bold text-yellow-300">
						{winner.id === userId ? 'You' : `${winner.id.slice(0, 2)}…${winner.id.slice(-3)}`}
					</span>
				</p>

				{/* --- leaderboard list ---------------------------------- */}
				<div className="flex max-h-60 flex-col gap-2 overflow-y-auto pr-1">
					{sorted.map((s, idx) => {
						const pos = idx + 1;
						return (
							<div
								key={s.id}
								className={clsx(
									'flex items-center justify-between rounded px-3 py-2 transition',
									rowTint(pos),
									userId === s.id && 'ring-2 ring-indigo-500/80'
								)}
							>
								<span className="w-7 text-center text-lg font-bold tabular-nums">{pos}</span>

								<span className="flex-1 truncate px-2 text-sm font-medium">
									{userId === s.id ? 'You' : `${s.id.slice(0, 2)}…${s.id.slice(-3)}`}
								</span>

								<span className="text-sm tabular-nums text-zinc-300">{s.lap}&nbsp;laps</span>
							</div>
						);
					})}
				</div>

				{/* --- close btn ---------------------------------------- */}
				<Button variant="secondary" className="mt-5 w-full bg-red-600 hover:bg-red-500" onClick={onClose}>
					Continue
				</Button>
			</DialogContent>
		</Dialog>
	);
}
