import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import ThemeProvider from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
	title: 'Radioactive | Multiplayer F1 Manager',
	description: 'Race-strategy with friends in real time',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider afterSignOutUrl="/">
			<html lang="en">
				<body className={inter.className}>
					<ThemeProvider attribute="class" defaultTheme="dark">
						{children}
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
