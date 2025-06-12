'use client';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { ArrowRight, Activity, Zap, Flame, Leaf } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Footer from '@/components/footer';

export default function Home() {
	const { isSignedIn, getToken } = useAuth();

	useEffect(() => {
		if (isSignedIn) {
			getToken().then((token) => {
				if (!token) return;

				fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				})
					.then((res) => res.json())
					.then((data) => {
						console.log('User registered:', data);
					})
					.catch((err) => {
						console.error('Registration error:', err);
					});
			});
		}
	}, [isSignedIn]);

	return (
		<>
			<Navbar />
			<section className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-black via-zinc-900 to-black px-6">
				{/* hero graphic */}
				{/* <Image
          src="/f1_hero.png"
          alt="Formula 1 car on neon track"
          fill
          priority
          className="-z-10 object-cover opacity-80"
        /> */}

				{/* copy */}
				<div className="mx-auto max-w-3xl text-center">
					<h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
						Own the <span className="text-red-600">strategy</span>, <br /> win the&nbsp;race.
					</h1>
					<p className="mt-6 text-lg text-zinc-300">
						Radioactive is a real-time multiplayer F1 manager style game for radio engineers! Change engine modes, deploy ERS
						boosts, and out-smart friends lap after lap.
					</p>
					{isSignedIn ? (
						<div className="flex flex-row items-center justify-center gap-4">
							<Link href="/dashboard">
								<Button size="lg" className="mt-8 bg-red-600 text-white hover:bg-red-500">
									Go to Dashboard&nbsp;
									<ArrowRight className="ml-2 h-5 w-5" />
								</Button>
							</Link>
							<Link href="/howtoplay">
								<Button size="lg" className="mt-8 bg-red-600 text-white hover:bg-red-500">
									How to Play&nbsp;
									<ArrowRight className="ml-2 h-5 w-5" />
								</Button>
							</Link>
						</div>
					) : (
						<div className="flex flex-row items-center justify-center gap-4">
							<Link href="/sign-in">
								<Button size="lg" className="mt-8 bg-red-600 text-white hover:bg-red-500">
									Sign In&nbsp;
									<ArrowRight className="ml-2 h-5 w-5" />
								</Button>
							</Link>
							<Link href="/sign-up">
								<Button size="lg" className="mt-8 bg-red-600 text-white hover:bg-red-500">
									Sign Up&nbsp;
									<ArrowRight className="ml-2 h-5 w-5" />
								</Button>
							</Link>
						</div>
					)}
				</div>
			</section>
			{/* ENGINE MODES SECTION */}
			<section className="bg-neutral-900/60 px-6 py-12 text-white">
				<div className="mx-auto max-w-3xl text-center">
					<h2 className="text-3xl font-bold">Engine Modes</h2>
					<p className="mt-4 text-lg text-zinc-300">
						Tap the radio to switch engine strategy in real‑time. Every mode has trade‑offs—learn when to use each one.
					</p>
				</div>

				<div className="mx-auto mt-8 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{/* Base */}
					<Card className="bg-zinc-800/60 shadow-lg">
						<CardHeader className="flex flex-row items-center gap-3">
							<Activity className="h-6 w-6 text-red-500" />
							<h3 className="text-xl font-semibold text-white">BASE</h3>
						</CardHeader>
						<CardContent className="mt-2 text-zinc-300">Default for steady turns.</CardContent>
					</Card>

					{/* Push */}
					<Card className="bg-zinc-800/60 shadow-lg">
						<CardHeader className="flex flex-row items-center gap-3">
							<Flame className="h-6 w-6 text-red-500" />
							<h3 className="text-xl font-semibold text-white">PUSH</h3>
						</CardHeader>
						<CardContent className="mt-2 text-zinc-300">
							Gives more top speed on straights. Beaware of low speed cornering.
						</CardContent>
					</Card>

					{/* ERS */}
					<Card className="bg-zinc-800/60 shadow-lg">
						<CardHeader className="flex flex-row items-center gap-3">
							<Zap className="h-6 w-6 text-red-500" />
							<h3 className="text-xl font-semibold text-white">ERS</h3>
						</CardHeader>
						<CardContent className="mt-2 text-zinc-300">
							Burst of electric power.
							<br />
							Drains battery fast—time it wisely.
						</CardContent>
					</Card>

					{/* Conserve */}
					<Card className="bg-zinc-800/60 shadow-lg">
						<CardHeader className="flex flex-row items-center gap-3">
							<Leaf className="h-6 w-6 text-red-500" />
							<h3 className="text-xl font-semibold text-white">CONSERVE</h3>
						</CardHeader>
						<CardContent className="mt-2 text-zinc-300">
							Lean fuel &amp; gentle throttle.
							<br />
							Save ERS.
						</CardContent>
					</Card>
				</div>
			</section>
			{/* footer */}
			<Footer />
		</>
	);
}
