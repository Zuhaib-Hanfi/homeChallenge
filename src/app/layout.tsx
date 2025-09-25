import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'

export const metadata: Metadata = {
	title: 'Funeral Services',
	description: 'Internal tool',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className="bg-white" suppressHydrationWarning>
				<div className="min-h-screen w-full bg-white relative overflow-hidden">
					<div
						className="absolute inset-0 z-0 pointer-events-none"
						style={{
							backgroundImage: `radial-gradient(circle at center, #c4b5fd, transparent)`
						}}
					/>
					<div className="relative z-10">
						<Header />
						<main className="max-w-6xl mx-auto px-4 py-6">
							{children}
						</main>
					</div>
				</div>
			</body>
		</html>
	)
}
