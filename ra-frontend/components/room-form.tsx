'use client';

import { SetStateAction, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// shadcn/ui primitives
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import ReactCountryFlag from 'react-country-flag';

import type { FC } from 'react';

export const TRACKS = [
	{ id: 'monza', iso: 'IT', name: 'Monza' },
	{ id: 'shanghai', iso: 'CN', name: 'Shanghai' },
	{ id: 'suzuka', iso: 'JP', name: 'Suzuka' },
	{ id: 'spa', iso: 'BE', name: 'Spa' },
	{ id: 'zandvoort', iso: 'NL', name: 'Zandvoort' },
	{ id: 'yasmarina', iso: 'AE', name: 'Yas Marina' },
	{ id: 'saopaulo', iso: 'BR', name: 'São Paulo' },
	{ id: 'silverstone', iso: 'GB', name: 'Silverstone' },
	{ id: 'spielberg', iso: 'AT', name: 'Spielberg' },
	{ id: 'catalunya', iso: 'ES', name: 'Catalunya' },
	{ id: 'sakhir', iso: 'BH', name: 'Sakhir' },
	{ id: 'melbourne', iso: 'AU', name: 'Melbourne' },
	{ id: 'budapest', iso: 'HU', name: 'Budapest' },
	{ id: 'austin', iso: 'US', name: 'Austin' },
] as const;

export default function RoomForm() {
	const [roomName, setRoomName] = useState('');
	const [track, setTrack] = useState('monza');
	const [laps, setLaps] = useState(30);
	const [roomCode, setRoomCode] = useState('');
	const [isCreating, setCreating] = useState(false);

	const router = useRouter();
	const { getToken } = useAuth();

	const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://radioactive-backend.kaushalpatil10.workers.dev';

	/* ─── create ───────────────────────── */
	async function createRoom() {
		if (isCreating) return;
		setCreating(true);
		try {
			const token = await getToken();
			const res = await fetch(`${API}/api/room`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ name: roomName, track, laps }),
			});
			if (!res.ok) throw new Error(await res.text());
			const { roomId } = await res.json();
			router.push(`/game/${roomId}`);
		} catch (err) {
			console.error(err);
			alert('Could not create room – see console.');
		} finally {
			setCreating(false);
		}
	}

	/* ─── join ─────────────────────────── */
	function joinRoom() {
		if (!roomCode.trim()) return;
		router.push(`/game/${roomCode.trim()}`);
	}

	/* ─── render ───────────────────────── */
	return (
		<div className="grid gap-10 md:grid-cols-2">
			{/* CREATE  */}
			<Card className="bg-gradient-to-br from-neutral-900/80 via-neutral-800/80 to-neutral-900/60 shadow-2xl">
				<CardHeader>
					<CardTitle className="text-2xl">Host a New Race</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-8">
					<Input
						placeholder="Room name (optional)"
						value={roomName}
						onChange={(e) => setRoomName(e.target.value)}
						disabled={isCreating}
						style={{ display: 'none' }}
					/>

					{/* Track grid */}
					<div>
						<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Circuit</p>

						<div className="grid auto-cols-fr grid-cols-5 gap-2 sm:grid-cols-6">
							{TRACKS.map(({ id, iso, name }) => {
								const selected = track === id;
								return (
									<button
										key={id}
										title={name}
										disabled={isCreating}
										onClick={() => setTrack(id)}
										className={`
            group relative flex h-16 w-16 flex-col items-center justify-center rounded-md
            ring-2 transition
            ${selected ? 'ring-red-600' : 'ring-transparent hover:ring-zinc-500/60'}
          `}
									>
										{/* flag */}
										<ReactCountryFlag
											countryCode={iso}
											svg
											style={{ width: '1.75rem', height: '1.25rem' }} // ≈28 × 20 px
											aria-label={name}
										/>

										{/* track name */}
										<span className="mt-1 text-[10px] leading-none text-zinc-200 group-hover:text-white">{name}</span>

										{/* glow when selected */}
										{selected && <span className="absolute inset-0 animate-pulse rounded-md bg-red-600/30" />}
									</button>
								);
							})}
						</div>
					</div>

					{/* Lap slider */}
					<div>
						<div className="flex items-center justify-between">
							<p className="text-sm font-semibold uppercase tracking-wider text-zinc-300">Laps</p>
							<span className="rounded bg-zinc-700 px-2 py-0.5 text-xs">{laps}</span>
						</div>
						<Slider
							min={1}
							max={99}
							step={1}
							value={[laps]}
							onValueChange={(v: SetStateAction<number>[]) => setLaps(v[0])}
							disabled={isCreating}
							className="mt-2"
						/>
					</div>

					<Button
						size="lg"
						disabled={isCreating}
						onClick={createRoom}
						className="flex items-center justify-center gap-2 bg-red-600 text-lg hover:bg-red-500"
					>
						{isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
						{isCreating ? 'Creating…' : 'Start Race'}
						{!isCreating && <ArrowRight className="ml-1 h-4 w-4" />}
					</Button>
				</CardContent>
			</Card>

			{/* JOIN  */}
			<Card className="bg-gradient-to-br from-neutral-900/80 via-neutral-800/80 to-neutral-900/60 shadow-2xl">
				<CardHeader>
					<CardTitle className="text-2xl">Join Friends</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-6">
					<Input
						placeholder="Paste room code"
						value={roomCode}
						onChange={(e) => setRoomCode(e.target.value)}
						disabled={isCreating}
					/>
					<Button variant="secondary" onClick={joinRoom} className="bg-zinc-700 text-white hover:bg-zinc-600">
						Join Race
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
