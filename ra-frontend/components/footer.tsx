import React from 'react';
import { Github, Instagram, Linkedin, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
	return (
		<footer className="bg-black/90 px-6 py-8 text-white">
			<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
				<span className="text-sm text-zinc-400">&copy; {new Date().getFullYear()} Kaushal Patil</span>
				<div className="flex items-center gap-6">
					<a href="https://github.com/Kaushal1011" target="_blank" rel="noopener noreferrer" className="hover:text-red-500">
						<Github className="h-5 w-5" />
					</a>
					<a
						href="https://www.linkedin.com/in/kaushal1011/" /* TODO: replace with your LinkedIn URL */
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-red-500"
					>
						<Linkedin className="h-5 w-5" />
					</a>
					<a
						href="https://www.instagram.com/kau5hal10/#" /* TODO: replace with your Instagram URL */
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-red-500"
					>
						<Instagram className="h-5 w-5" />
					</a>
					<a
						href="https://x.com/kau5hal10" /* TODO: replace with your Twitter URL */
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-red-500"
					>
						<Twitter className="h-5 w-5" />
					</a>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
