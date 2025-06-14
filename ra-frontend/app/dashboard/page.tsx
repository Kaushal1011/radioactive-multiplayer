import { currentUser } from '@clerk/nextjs/server';
import RoomForm from '@/components/room-form';
import Footer from '@/components/footer';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
	const user = await currentUser();

	if (!user) redirect('/sign-in?redirect_url=/dashboard');

	return (
		<div className="flex flex-col" style={{ minHeight: '91dvh' }}>
			{'  '}
			<main className="mx-auto flex max-w-5xl flex-1 flex-col gap-10 px-6 py-16">
				<h2 className="text-3xl font-bold">Welcome{user ? `, ${user.firstName}` : ''}! Choose your battle plan.</h2>
				<RoomForm />
			</main>

			<Footer />
		</div>
	);
}

export const runtime = 'edge'; // use edge runtime for faster response times
