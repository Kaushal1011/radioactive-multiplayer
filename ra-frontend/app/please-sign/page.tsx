/* app/auth-required/page.tsx */
'use client';

import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';

export default function PleaseSign() {
	const params = useSearchParams();

	return (
		<>
			<Navbar />

			<main className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center bg-gradient-to-b from-black via-neutral-950 to-black px-6 text-white">
				{/* card */}
				<section className="w-full max-w-md rounded-xl border border-neutral-700 bg-neutral-900/70 p-10 text-center shadow-2xl backdrop-blur-md">
					<Flag className="mx-auto mb-4 h-10 w-10 text-red-600" />
					<h1 className="mb-6 text-3xl font-extrabold tracking-wide">Sign&nbsp;in to join the&nbsp;race</h1>

					<p className="mb-8 text-zinc-300">
						Radio commands, ERS boosts, wheel-to-wheel action get in the cockpit by logging in below.
					</p>
				</section>
			</main>
		</>
	);
}
