import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import ThemeProvider from '@/components/theme-provider';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Radioactive | Multiplayer Racing Radio Game',
	description: 'Race-strategy with friends in real time',
	keywords: ['F1', 'Formula 1', 'multiplayer', 'strategy', 'racing', 'game'],
	authors: [{ name: 'Kaushal Patil' }],
	themeColor: '#000000',
	icons: {
		icon: '/favicon.svg',
	},
	openGraph: {
		title: 'Radioactive | Multiplayer Racing Radio Game',
		description: 'Race-strategy with friends in real time',
		url: 'https://radioactive.dev',
		type: 'website',
		images: [{ url: '/og-image.png' }],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Radioactive | Multiplayer Racing Radio Game',
		description: 'Race-strategy with friends in real time',
		images: ['/og-image.png'],
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<ClerkProvider afterSignOutUrl="/">
				<body className={inter.className}>
					<ThemeProvider attribute="class" defaultTheme="dark">
						{children}
					</ThemeProvider>
				</body>
			</ClerkProvider>
		</html>
	);
}
