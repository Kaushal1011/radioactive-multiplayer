'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Gauge } from 'lucide-react';

export function Navbar() {
	const { isSignedIn } = useAuth();
	return (
		<nav className="sticky top-0 z-50 w-full border-b bg-black/80 backdrop-blur">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
				{/* logo */}
				<Link href="/" className="flex items-center gap-2 font-bold text-red-600">
					<Gauge className="h-6 w-6 animate-pulse" />
					RADIOACTIVE
				</Link>

				{/* auth */}

				<div className="flex items-center gap-3">
					{isSignedIn ? (
						<div className="flex flex-row items-center gap-2">
							<Link href="/dashboard">
								<Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-600/10">
									Dashboard
								</Button>
							</Link>
							<Link href="/howtoplay">
								<Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-600/10">
									How to Play
								</Button>
							</Link>
						</div>
					) : null}
					{/* sign in button */}
					{isSignedIn ? (
						<UserButton afterSignOutUrl="/" />
					) : (
						<div className="flex flex-row items-center gap-2">
							<SignInButton mode="modal">
								<Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-600/10">
									Sign in
								</Button>
							</SignInButton>
							<SignUpButton mode="modal">
								<Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-600/10">
									Sign up
								</Button>
							</SignUpButton>
						</div>
					)}
				</div>
			</div>
		</nav>
	);
}
