'use client';

import { Suspense, use, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import CommandPanel from '@/components/CommandPanel';
import PlayersList from '@/components/PlayersList';
import TelemetryBar from '@/components/TelemetryBar';
import TrackCanvas from '@/components/TrackCanvas';
import { useRaceSocket } from '@/hooks/useRaceSocket';

type Props = {
	params: Promise<{ roomId: string }>; // <- Next.js injects this
};

export default function RacePage({ params }: Props) {
	const { roomId }: { roomId: string } = use(params); // no await needed
	const { userId } = useAuth();
	const [readySent, setReadySent] = useState(false);
	const [roomId123, setRoomId] = useState<string>('');
	const [track, setTrack] = useState<string>('monza'); // default track
	/* --- live game state via WS hook --------------------------- */
	const { cars, ready, send } = useRaceSocket(roomId123);
	const me = userId ? cars[userId] : undefined;
	useEffect(() => {
		if (!ready) return;

		// send join message to server
		console.log('Joining room:', roomId, 'as user:', userId);
		send({ type: 'join', playerId: userId });
	}, [ready]);

	useEffect(() => {
		if (!roomId) return;
		setRoomId(roomId);
		const fetchTrack = async () => {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/room/${roomId}`);
				const data = await res.json();
				setTrack(data.track); // <-- extract track and store it
			} catch (err) {
				console.error('Failed to fetch track info', err);
			}
		};

		if (roomId) fetchTrack();
	}, [roomId]);

	function sendReady() {
		if (!userId) return;
		// send ready message to server
		console.log('Sending ready state for user:', userId);
		if (readySent) return; // avoid double sending
		setReadySent(true);
		send({ type: 'ready', playerId: userId });
	}

	const handleRadio = (cmd: string) => {
		send({ type: 'input', playerId: userId, input: cmd });
	};

	return (
		<div className="flex min-h-screen flex-col bg-gradient-to-b from-black via-neutral-950 to-black">
			<Navbar />

			{/* header */}
			<header className="flex items-center justify-between gap-4 border-b border-neutral-800 px-6 py-3 text-white">
				<div className="flex items-center gap-2">
					<h1 className="text-xl font-semibold uppercase tracking-wider">{track.toUpperCase()}</h1>
					<Button disabled={readySent} onClick={sendReady} className=" hover:text-white">
						Ready
					</Button>
				</div>
				<span className="text-sm text-muted-foreground">Room {roomId}</span>
			</header>

			{/* main grid */}
			<div className="grid flex-1 grid-cols-[260px_1fr_220px] grid-rows-[1fr_auto] gap-4 p-4">
				<CommandPanel onSend={handleRadio} />

				<Suspense fallback={<div className="rounded bg-neutral-900/40" />}>
					{ready ? <TrackCanvas track={track} cars={cars} /> : null}
				</Suspense>

				{ready && me ? <PlayersList cars={cars} meId={userId ?? undefined} /> : null}
				<div className="col-span-3">
					<TelemetryBar car={me} />
				</div>
			</div>
		</div>
	);
}

export const runtime = 'edge';
