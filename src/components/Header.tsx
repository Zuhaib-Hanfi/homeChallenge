'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSupabaseBrowserClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Header() {
	const [user, setUser] = useState<any>(null)
	const [userRole, setUserRole] = useState<string>('')
	const [loading, setLoading] = useState(true)
	const router = useRouter()

	useEffect(() => {
		const supabase = getSupabaseBrowserClient()

		async function loadUser() {
			const { data: { user } } = await supabase.auth.getUser()
			setUser(user)
			let role = ''
			if (user) {
				role = sessionStorage.getItem('userRole') || ''
				if (!role) {
					const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
					role = profile?.role || 'customer'
					sessionStorage.setItem('userRole', role)
				}
			}
			setUserRole(role)
			setLoading(false)
		}

		loadUser()

		const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
			// Only act on meaningful events; ignore TOKEN_REFRESH to prevent re-render loops
			if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
				const nextUser = session?.user ?? null
				setUser(nextUser)
				if (nextUser) {
					// Reuse cached role when available; refetch once if missing
					let role = sessionStorage.getItem('userRole') || ''
					if (!role) {
						const { data: profile } = await supabase.from('profiles').select('role').eq('id', nextUser.id).single()
						role = profile?.role || 'customer'
						sessionStorage.setItem('userRole', role)
					}
					setUserRole(role)
				} else {
					sessionStorage.removeItem('userRole')
					setUserRole('')
				}
				// Refresh once to sync any server-rendered data
				router.refresh()
			}
		})

		return () => {
			listener.subscription.unsubscribe()
		}
	}, [router])

	async function signOut() {
		const supabase = getSupabaseBrowserClient()
		await supabase.auth.signOut()
		router.replace('/login')
	}

	const isStaff = ['admin', 'director', 'manager'].includes(userRole)

	if (loading) {
		return (
			<header className="bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/50 border-b border-white/40">
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
		<header className="bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/50 border-b border-white/40">
			<div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
				<nav className="space-x-6 text-sm">
					<Link className="text-slate-800 hover:text-slate-900 font-medium" href="/">Home</Link>
					{isStaff && <Link className="text-slate-800 hover:text-slate-900 font-medium" href="/team">Team</Link>}
					{isStaff && <Link className="text-slate-800 hover:text-slate-900 font-medium" href="/cases/new">New Case</Link>}
					<Link className="text-slate-800 hover:text-slate-900 font-medium" href="/customer">Customer Portal</Link>
				</nav>
				<div className="text-sm flex items-center gap-3">
					{user?.email ? (
						<>
							<span className="text-slate-700">{user.email}</span>
							<span className="text-xs bg-white/70 border border-white/40 text-slate-700 px-2 py-1 rounded-md backdrop-blur-sm">{userRole}</span>
						</>
					) : (
						<Link className="text-slate-800 hover:text-slate-900 font-medium" href="/login">Sign in</Link>
					)}
					{user?.email && (
						<button 
							onClick={signOut}
							className="border border-white/40 bg-white/70 rounded-md px-3 py-1 text-slate-800 hover:bg-white/80 backdrop-blur-sm"
						>
							Sign out
						</button>
					)}
				</div>
			</div>
		</header>
	)
}
