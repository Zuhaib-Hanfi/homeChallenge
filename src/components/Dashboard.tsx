'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSupabaseBrowserClient } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function Skeleton({ className }: { className?: string }) {
	return <div className={`bg-slate-200/60 animate-pulse rounded ${className || ''}`} />
}

function timeout<T>(p: Promise<T>, ms = 8000): Promise<T> {
	return new Promise((resolve, reject) => {
		const id = setTimeout(() => reject(new Error('Request timed out')), ms)
		p.then(v => { clearTimeout(id); resolve(v) }).catch(e => { clearTimeout(id); reject(e) })
	})
}

export default function Dashboard() {
	const [user, setUser] = useState<any>(null)
	const [userRole, setUserRole] = useState<string>('')
	const [recentCases, setRecentCases] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string>('')

	useEffect(() => {
		let cancelled = false
		async function loadData() {
			try {
				const supabase = getSupabaseBrowserClient()
				const { data: userResp, error: userErr } = await timeout(supabase.auth.getUser())
				if (userErr) throw userErr
				if (cancelled) return
				setUser(userResp.user)
				let role = ''
				if (userResp.user) {
					role = sessionStorage.getItem('userRole') || ''
					if (!role) {
						const { data: profile, error: profileErr } = await timeout(
							supabase.from('profiles').select('role').eq('id', userResp.user.id).single()
						)
						if (profileErr) throw profileErr
						role = profile?.role || 'customer'
						sessionStorage.setItem('userRole', role)
					}
					const isStaff = ['admin', 'director', 'manager'].includes(role)
					if (isStaff) {
						const { data, error: casesErr } = await timeout(
							supabase
								.from('cases')
								.select('id, title, status, created_at')
								.order('created_at', { ascending: false })
								.limit(5)
						)
						if (casesErr) throw casesErr
						if (cancelled) return
						setRecentCases(data || [])
					}
				}
				if (cancelled) return
				setUserRole(role)
			} catch (e: any) {
				console.error('Dashboard load error:', e)
				if (!cancelled) setError(e?.message || 'Failed to load data')
			} finally {
				if (!cancelled) setLoading(false)
			}
		}
		loadData()
		return () => { cancelled = true }
	}, [])

	if (loading) {
		return (
			<main className="space-y-6">
				<div>
					<div className="h-8 w-72 bg-slate-200/60 rounded animate-pulse" />
					<div className="h-4 w-52 bg-slate-200/60 rounded mt-2 animate-pulse" />
				</div>
				<div className="grid gap-6 md:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Recent Cases</CardTitle>
						</CardHeader>
						<CardContent>
							<Skeleton className="h-8 w-full mb-2" />
							<Skeleton className="h-8 w-full mb-2" />
							<Skeleton className="h-8 w-full" />
						</CardContent>
					</Card>
				</div>
			</main>
		)
	}

	if (error) {
		return (
			<main className="space-y-4">
				<Card>
					<CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
				</Card>
			</main>
		)
	}

	const isStaff = ['admin', 'director', 'manager'].includes(userRole)
	
	return (
		<main className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-slate-900">Funeral Services Dashboard</h1>
				<p className="text-slate-600 mt-1">Welcome back, {user?.email}</p>
			</div>
			
			{isStaff ? (
				<div className="grid gap-6 md:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<Button asChild className="w-full">
								<Link href="/cases/new">Create New Case</Link>
							</Button>
							<Button variant="outline" asChild className="w-full">
								<Link href="/team">View Team</Link>
							</Button>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Recent Cases</CardTitle>
						</CardHeader>
						<CardContent>
							{recentCases.length > 0 ? (
								<div className="space-y-2">
									{recentCases.map((c) => (
										<div key={c.id} className="flex justify-between items-center p-2 border rounded bg-white/60 backdrop-blur-sm">
											<div>
												<div className="font-medium text-sm text-slate-900">{c.title}</div>
												<div className="text-xs text-slate-500">{new Date(c.created_at).toISOString().slice(0,10)}</div>
											</div>
											<Button variant="outline" size="sm" asChild>
												<Link href={`/cases/${c.id}`}>View</Link>
											</Button>
										</div>
									))}
								</div>
							) : (
								<p className="text-slate-500 text-sm">No cases yet</p>
							)}
						</CardContent>
					</Card>
				</div>
			) : (
				<Card>
					<CardHeader>
						<CardTitle>Customer Portal</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-slate-600 mb-4">View your case status and progress.</p>
						<Button asChild>
							<Link href="/customer">View My Cases</Link>
						</Button>
					</CardContent>
				</Card>
			)}
		</main>
	)
}
