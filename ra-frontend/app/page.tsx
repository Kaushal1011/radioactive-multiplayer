'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { Flame, Zap, Activity, Leaf, Users, Settings2, Clock4, Trophy, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Footer from '@/components/footer';

export default function LandingPage() {
	const { isSignedIn, getToken } = useAuth();

	// auto-register user on backend (silent)
	useEffect(() => {
		if (!isSignedIn) return;
		(async () => {
			const token = await getToken();
			if (!token) return;
			try {
				await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				});
			} catch (e) {
				console.error(e);
			}
		})();
	}, [isSignedIn, getToken]);

	return (
		<>
			<Navbar />

			{/* ── HERO ─────────────────────────────────────────────── */}
			<section className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-black via-neutral-900 to-black px-6">
				{/* headline */}
				<div className="z-10 mx-auto max-w-4xl text-center">
					<h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
						Own the&nbsp;<span className="text-red-600">strategy</span>,<br /> rule the&nbsp;race.
					</h1>
					<p className="mt-6 text-lg text-zinc-300">
						<span className="font-semibold text-white">Radioactive</span> is an online, real-time Formula-1 strategy game.
						Call the shots, deploy ERS, and out-think rivals lap after lap.
					</p>

					{/* CTA buttons */}
					<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
						{isSignedIn ? (
							<>
								<Link href="/dashboard">
									<Button size="lg" className="bg-red-600 text-white hover:bg-red-500">
										Dashboard <ArrowRight className="ml-2 h-5 w-5" />
									</Button>
								</Link>
								<Link href="/howtoplay">
									<Button variant="outline" size="lg" className="border-red-600 text-red-400 hover:bg-red-600/10">
										How to Play
									</Button>
								</Link>
							</>
						) : (
							<>
								<Link href="/sign-up">
									<Button size="lg" className="bg-red-600 text-white hover:bg-red-500">
										Sign Up Free <ArrowRight className="ml-2 h-5 w-5" />
									</Button>
								</Link>
								<Link href="/howtoplay">
									<Button variant="outline" size="lg" className="border-red-600 text-red-400 hover:bg-red-600/10">
										How it Works
									</Button>
								</Link>
							</>
						)}
					</div>
				</div>

				{/* subtle backdrop circles */}
				<div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-20">
					<div className="size-[120vmax] animate-pulse rounded-full bg-red-600/30 blur-3xl" />
				</div>
			</section>

			{/* ── FEATURES ─────────────────────────────────────────── */}
			<section className="border-y border-neutral-800 bg-neutral-900/60 px-6 py-16 text-white backdrop-blur">
				<div className="mx-auto max-w-4xl text-center">
					<h2 className="text-3xl font-bold">Why you’ll love Radioactive</h2>
				</div>

				<div className="mx-auto mt-10 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{/* Multiplayer */}
					<Card className="bg-neutral-800/60">
						<CardHeader className="flex flex-row items-center gap-3 pb-1 text-xl font-semibold">
							<Users className="h-6 w-6 text-red-500" />
							Real-time Multiplayer
						</CardHeader>
						<CardContent className="text-zinc-300">
							Up to 10+ friends in one lobby. Every radio call is broadcast instantly—victory is one bold move away.
						</CardContent>
					</Card>
					{/* Strategy */}
					<Card className="bg-neutral-800/60">
						<CardHeader className="flex flex-row items-center gap-3 pb-1 text-xl font-semibold">
							<Settings2 className="h-6 w-6 text-red-500" />
							Deep Strategy
						</CardHeader>
						<CardContent className="text-zinc-300">
							Balance ERS charge, engine PUSH, and track layout. Adapt or fall behind.
						</CardContent>
					</Card>
					{/* Live physics */}
					<Card className="bg-neutral-800/60">
						<CardHeader className="flex flex-row items-center gap-3 pb-1 text-xl font-semibold">
							<Clock4 className="h-6 w-6 text-red-500" />
							30&nbsp;Hz Physics Engine
						</CardHeader>
						<CardContent className="text-zinc-300">
							Smooth, deterministic car dynamics calculated 30&nbsp;times per second for every racer.
						</CardContent>
					</Card>
					{/* Modes */}
					<Card className="bg-neutral-800/60">
						<CardHeader className="flex flex-row items-center gap-3 pb-1 text-xl font-semibold">
							<Zap className="h-6 w-6 text-red-500" />
							Dynamic Engine Modes
						</CardHeader>
						<CardContent className="text-zinc-300">
							Switch between <span className="font-semibold text-white">PUSH</span>,{' '}
							<span className="font-semibold text-white">ERS</span>, and{' '}
							<span className="font-semibold text-white">CONSERVE</span> on the fly.
						</CardContent>
					</Card>
					{/* Telemetry */}
					<Card className="bg-neutral-800/60">
						<CardHeader className="flex flex-row items-center gap-3 pb-1 text-xl font-semibold">
							<Activity className="h-6 w-6 text-red-500" />
							Live Telemetry
						</CardHeader>
						<CardContent className="text-zinc-300">
							Speed, ERS %, mode—everything you need displayed in real-time at the bottom of your screen.
						</CardContent>
					</Card>
					{/* Victory */}
					<Card className="bg-neutral-800/60">
						<CardHeader className="flex flex-row items-center gap-3 pb-1 text-xl font-semibold">
							<Trophy className="h-6 w-6 text-red-500" />
							Winner Takes All
						</CardHeader>
						<CardContent className="text-zinc-300">
							First to the chequered flag claims bragging rights. Photo-finishes welcomed.
						</CardContent>
					</Card>
				</div>
			</section>

			{/* ── ENGINE MODES GALLERY ─────────────────────────────── */}
			<section className="px-6 py-16 text-white">
				<div className="mx-auto max-w-4xl text-center">
					<h2 className="text-3xl font-bold">Master the Engine Modes</h2>
					<p className="mt-4 text-lg text-zinc-300">
						Every mode has a purpose. Learn the trade-offs and time your switches for maximum lap-time gain.
					</p>
				</div>

				<div className="mx-auto mt-10 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{/* Base */}
					<Card className="bg-neutral-800/60">
						<CardHeader className="flex flex-row items-center gap-3 pb-1 text-lg font-semibold">
							<Activity className="h-5 w-5 text-zinc-200" /> BASE
						</CardHeader>
						<CardContent className="text-sm text-zinc-300">Balanced output—good for most situations.</CardContent>
					</Card>
					{/* Push */}
					<Card className="bg-neutral-800/60">
						<CardHeader className="flex flex-row items-center gap-3 pb-1 text-lg font-semibold">
							<Flame className="h-5 w-5 text-red-500" /> PUSH
						</CardHeader>
						<CardContent className="text-sm text-zinc-300">Increased power on straights; harder on tyres.</CardContent>
					</Card>
					{/* ERS */}
					<Card className="bg-neutral-800/60">
						<CardHeader className="flex flex-row items-center gap-3 pb-1 text-lg font-semibold">
							<Zap className="h-5 w-5 text-yellow-400" /> ERS
						</CardHeader>
						<CardContent className="text-sm text-zinc-300">Massive electric boost—use sparingly.</CardContent>
					</Card>
					{/* Conserve */}
					<Card className="bg-neutral-800/60">
						<CardHeader className="flex flex-row items-center gap-3 pb-1 text-lg font-semibold">
							<Leaf className="h-5 w-5 text-green-400" /> CONSERVE
						</CardHeader>
						<CardContent className="text-sm text-zinc-300">Save fuel & recharge ERS while coasting.</CardContent>
					</Card>
				</div>
			</section>

			{/* ── FOOTER ───────────────────────────────────────────── */}
			<Footer />
		</>
	);
}
