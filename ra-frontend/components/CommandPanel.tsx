'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const COMMANDS = ['BASE', 'CONSERVE', 'PUSH', 'ERS'];

export default function CommandPanel({ onSend }: { onSend: (cmd: string) => void }) {
	const [log, setLog] = useState<string[]>([]);

	const send = (cmd: string) => {
		const stamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		setLog((l) => [`${stamp} – ${cmd}`, ...l]);
		onSend(cmd);
	};

	return (
		<Card className="flex h-full flex-col">
			<CardHeader className="pb-2 text-lg font-semibold">Radio</CardHeader>
			<CardContent className="flex flex-1 flex-col gap-3 py-2">
				<div className="grid grid-cols-2 gap-2">
					{COMMANDS.map((c) => (
						<Button key={c} variant="secondary" size="sm" onClick={() => send(c)}>
							{c}
						</Button>
					))}
				</div>
				<div className="mt-3  max-h-84 flex-1 overflow-y-auto rounded border p-2 text-sm">
					{log.length === 0 ? (
						<p className="text-muted-foreground">No messages yet.</p>
					) : (
						log.map((m, i) => <p key={i}>{m}</p>)
					)}
				</div>
			</CardContent>
		</Card>
	);
}
