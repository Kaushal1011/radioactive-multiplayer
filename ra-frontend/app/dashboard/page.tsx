import { currentUser } from '@clerk/nextjs/server';
import { RoomForm } from '@/components/room-form';

export default async function Dashboard() {
	const user = await currentUser(); // optional profile display

	return (
		<main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16">
			<h2 className="text-3xl font-bold">Welcome{user ? `, ${user.firstName}` : ''}! Choose your battle plan.</h2>
			<RoomForm />
		</main>
	);
}

export const runtime = 'edge'; // use edge runtime for better performance
