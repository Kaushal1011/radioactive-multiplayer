import { Navbar } from '@/components/navbar';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Navbar />
			<SignedIn>{children}</SignedIn>

			<SignedOut>
				<div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-4 text-center">
					<p className="text-xl">You must sign in to access the game.</p>
					<SignInButton mode="modal" />
				</div>
			</SignedOut>
		</>
	);
}
