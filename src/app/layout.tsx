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
			<body className="bg-slate-50">
				<Header />
				<main className="max-w-6xl mx-auto px-4 py-6">
					{children}
				</main>
			</body>
		</html>
	)
}
