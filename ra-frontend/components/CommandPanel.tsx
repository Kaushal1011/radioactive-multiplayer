'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { InputType } from '@/hooks/useRaceSocket';
import clsx from 'clsx';

const COMMANDS: Array<{ key: InputType; label: string; desc: string; accent: string }> = [
	{ key: 'RACE', label: 'Race', desc: 'Balanced baseline mapping', accent: 'from-slate-600 to-slate-500' },
	{ key: 'ATTACK', label: 'Attack', desc: 'Extra pace with moderate battery drain', accent: 'from-orange-600 to-amber-500' },
	{ key: 'DEPLOY', label: 'Deploy', desc: 'Maximum electrical deployment for overtakes', accent: 'from-fuchsia-600 to-pink-500' },
	{ key: 'HARVEST', label: 'Harvest', desc: 'Lift-and-coast to refill battery', accent: 'from-emerald-700 to-green-500' },
	{ key: 'XMODE', label: 'X Mode', desc: 'Low drag straight-line setup', accent: 'from-cyan-600 to-sky-500' },
	{ key: 'ZMODE', label: 'Z Mode', desc: 'High downforce corner setup', accent: 'from-indigo-700 to-violet-600' },
];

export default function CommandPanel({ onSend }: { onSend: (cmd: InputType) => void }) {
	const [active, setActive] = useState<InputType>('RACE');
	const [log, setLog] = useState<string[]>([]);

	const send = (cmd: InputType) => {
		const stamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		setActive(cmd);
		setLog((l) => [`${stamp} · ${cmd}`, ...l].slice(0, 10));
		onSend(cmd);
	};

	return (
		<Card className="border-neutral-800 bg-neutral-900/70 text-white backdrop-blur">
			<CardHeader className="pb-1 text-lg font-semibold">Race Engineer</CardHeader>
			<CardContent className="space-y-3">
				<div className="grid gap-2">
					{COMMANDS.map((cmd) => (
						<Button
							key={cmd.key}
							onClick={() => send(cmd.key)}
							variant="secondary"
							className={clsx(
								'justify-start border border-white/10 bg-gradient-to-r text-left h-auto py-2 px-3',
								cmd.accent,
								active === cmd.key ? 'ring-2 ring-white/70' : 'opacity-85 hover:opacity-100'
							)}
						>
							<div>
								<p className="text-sm font-semibold uppercase tracking-wide">{cmd.label}</p>
								<p className="text-xs text-white/85">{cmd.desc}</p>
							</div>
						</Button>
					))}
				</div>
				<div className="rounded-md border border-neutral-700 bg-black/30 p-2 text-xs">
					<p className="mb-1 font-medium text-white/80">Radio Log</p>
					{log.length === 0 ? <p className="text-white/50">No instructions yet.</p> : log.map((line, idx) => <p key={idx}>{line}</p>)}
				</div>
			</CardContent>
		</Card>
	);
}
