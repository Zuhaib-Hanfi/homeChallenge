'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSupabaseBrowserClient } from '@/lib/supabaseClient'

export default function Header() {
	const [user, setUser] = useState<any>(null)
	const [userRole, setUserRole] = useState<string>('')
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function loadUser() {
			const supabase = getSupabaseBrowserClient()
			const { data: { user } } = await supabase.auth.getUser()
			setUser(user)
			
			if (user) {
				const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
				setUserRole(profile?.role || 'customer')
			}
			setLoading(false)
		}
		loadUser()
	}, [])

	async function signOut() {
		const supabase = getSupabaseBrowserClient()
		await supabase.auth.signOut()
		window.location.href = '/login'
	}

	const isStaff = ['admin', 'director', 'manager'].includes(userRole)

	if (loading) {
		return (
			<header className="border-b border-slate-200 bg-white">
				<div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
					<nav className="space-x-6 text-sm">
						<Link className="text-slate-700 hover:text-slate-900 font-medium" href="/">Home</Link>
					</nav>
					<div className="text-sm">Loading...</div>
				</div>
			</header>
		)
	}

	return (
		<header className="border-b border-slate-200 bg-white">
			<div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
				<nav className="space-x-6 text-sm">
					<Link className="text-slate-700 hover:text-slate-900 font-medium" href="/">Home</Link>
					{isStaff && <Link className="text-slate-700 hover:text-slate-900 font-medium" href="/team">Team</Link>}
					{isStaff && <Link className="text-slate-700 hover:text-slate-900 font-medium" href="/cases/new">New Case</Link>}
					<Link className="text-slate-700 hover:text-slate-900 font-medium" href="/customer">Customer Portal</Link>
				</nav>
				<div className="text-sm flex items-center gap-3">
					{user?.email ? (
						<>
							<span className="text-slate-600">{user.email}</span>
							<span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">{userRole}</span>
						</>
					) : (
						<Link className="text-slate-700 hover:text-slate-900 font-medium" href="/login">Sign in</Link>
					)}
					{user?.email && (
						<button 
							onClick={signOut}
							className="border border-slate-300 rounded-md px-3 py-1 text-slate-700 hover:bg-slate-50"
						>
							Sign out
						</button>
					)}
				</div>
			</div>
		</header>
	)
}
