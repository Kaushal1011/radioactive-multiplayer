'use client';

import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LogIn, AlarmClock, Radio, Activity, Flame, Zap, Leaf, Gauge, Flag } from 'lucide-react';
import Footer from '@/components/footer';
export default function HowToPlay() {
	return (
		<>
			{/* navbar */}
			<Navbar />
			{/* root wrapper */}
			<section className="min-h-[calc(100dvh-4rem)] w-full bg-gradient-to-b from-black via-neutral-950 to-black px-6 py-12 text-white">
				{/* hero */}
				<header className="mx-auto max-w-3xl text-center">
					<h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
						How&nbsp;to <span className="text-red-600">Play</span>
					</h1>
				</header>

				{/* steps grid */}
				<div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-2">
					{/* 1. create/join */}
					<Card>
						<CardHeader className="flex flex-row items-center gap-3 pb-2 text-xl font-semibold">
							<LogIn className="h-6 w-6 text-red-600" />
							1. Create or Join a Room
						</CardHeader>
						<CardContent className="space-y-3 text-zinc-300">
							<p>
								Head to the <span className="font-medium text-white">Dashboard</span> and either generate a new room with a
								track &amp; lap count or paste a friend&apos;s code to join.
							</p>
							<p className="text-sm text-zinc-400">
								Tracks include classics like Monza, Suzuka, and Silverstone — each pre-analysed for corner severity &amp;
								width.
							</p>
						</CardContent>
					</Card>

					{/* 2. ready up */}
					<Card>
						<CardHeader className="flex flex-row items-center gap-3 pb-2 text-xl font-semibold">
							<AlarmClock className="h-6 w-6 text-red-600" />
							2. Ready Up &amp; Countdown
						</CardHeader>
						<CardContent className="space-y-3 text-zinc-300">
							<p>
								Click <span className="font-medium text-white">Ready</span>. When every driver is set, a{' '}
								<span className="font-medium">3-second countdown</span> starts then the physics loop begins
								at&nbsp30&nbsp;Hz.
							</p>
							<p className="text-sm text-zinc-400">
								Your car launches at the track&apos;s start-line with default{' '}
								<span className="font-medium text-white">BASE</span> mode.
							</p>
						</CardContent>
					</Card>

					{/* 3. radio commands */}
					<Card className="lg:col-span-2">
						<CardHeader className="flex flex-row items-center gap-3 pb-2 text-xl font-semibold">
							<Radio className="h-6 w-6 text-red-600" />
							3. Master the Radio Commands
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
								{/* BASE */}
								<Card className="bg-neutral-900/60">
									<CardHeader className="flex flex-row items-center gap-2 pb-1 text-lg font-semibold">
										<Activity className="h-5 w-5 text-zinc-200" /> BASE
									</CardHeader>
									<CardContent className="text-sm text-zinc-300">
										Balanced driving. Full power on straights, capped 45&nbsp;ms⁻¹ in brake zones.
									</CardContent>
								</Card>
								{/* PUSH */}
								<Card className="bg-neutral-900/60">
									<CardHeader className="flex flex-row items-center gap-2 pb-1 text-lg font-semibold">
										<Flame className="h-5 w-5 text-red-500" /> PUSH
									</CardHeader>
									<CardContent className="text-sm text-zinc-300">
										+30% acceleration &amp; +10% top-speed on straights but tyres scream in the corners (-10% vmax).
									</CardContent>
								</Card>
								{/* ERS */}
								<Card className="bg-neutral-900/60">
									<CardHeader className="flex flex-row items-center gap-2 pb-1 text-lg font-semibold">
										<Zap className="h-5 w-5 text-yellow-400" /> ERS
									</CardHeader>
									<CardContent className="text-sm text-zinc-300">
										Deploy stored energy for +90% extra thrust &amp; +15% vmax until the 4kJ battery drains.
									</CardContent>
								</Card>
								{/* CONSERVE */}
								<Card className="bg-neutral-900/60">
									<CardHeader className="flex flex-row items-center gap-2 pb-1 text-lg font-semibold">
										<Leaf className="h-5 w-5 text-green-400" /> CONSERVE
									</CardHeader>
									<CardContent className="text-sm text-zinc-300">
										Ease off: -40% power, -10% vmax, gentler braking. Regenerates 35Js⁻¹ back into ERS.
									</CardContent>
								</Card>
							</div>
							<p className="mt-4 text-xs text-zinc-400">
								Hint: Time your <span className="text-yellow-400">ERS</span> deployments when exiting to long straights to
								accelerate fast and switch to&nbsp;
								<span className="text-green-400">CONSERVE</span> through heavy braking zones to refill until you reach base
								speed.
							</p>
						</CardContent>
					</Card>

					{/* 4. telemetry */}
					<Card>
						<CardHeader className="flex flex-row items-center gap-3 pb-2 text-xl font-semibold">
							<Gauge className="h-6 w-6 text-red-600" />
							4. Read the Telemetry
						</CardHeader>
						<CardContent className="space-y-3 text-zinc-300">
							<p>
								The bottom bar shows <span className="font-medium">Speed</span>, <span className="font-medium">ERS %</span>,
								and your current
								<span className="font-medium"> Mode</span> in real-time.
							</p>
							<p className="text-sm text-zinc-400">
								Speeds are in kmh⁻¹. ERS hits 0%? The car auto-reverts to{' '}
								<span className="font-medium text-white">BASE</span> mode.
							</p>
						</CardContent>
					</Card>

					{/* 5. win condition */}
					<Card>
						<CardHeader className="flex flex-row items-center gap-3 pb-2 text-xl font-semibold">
							<Flag className="h-6 w-6 text-red-600" />
							5. Take the Flag
						</CardHeader>
						<CardContent className="space-y-3 text-zinc-300">
							<p>
								Complete the set lap count first. Standings are ordered by total distance (laps * track length + current
								sector).
							</p>
							<p className="text-sm text-zinc-400">
								All cars finish? The physics loop stops automatically and the winner is crowned.
							</p>
						</CardContent>
					</Card>
				</div>
			</section>
			<Footer />

			{/* credits */}
		</>
	);
}

export const runtime = 'edge';
