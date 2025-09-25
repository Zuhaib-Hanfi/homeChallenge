'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSupabaseBrowserClient } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
	const [user, setUser] = useState<any>(null)
	const [userRole, setUserRole] = useState<string>('')
	const [recentCases, setRecentCases] = useState<any[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function loadData() {
			const supabase = getSupabaseBrowserClient()
			const { data: { user } } = await supabase.auth.getUser()
			setUser(user)
			
			if (user) {
				const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
				const role = profile?.role || 'customer'
				setUserRole(role)
				
				const isStaff = ['admin', 'director', 'manager'].includes(role)
				if (isStaff) {
					const { data } = await supabase.from('cases').select('id, title, status, created_at').order('created_at', { ascending: false }).limit(5)
					setRecentCases(data || [])
				}
			}
			setLoading(false)
		}
		loadData()
	}, [])

	if (loading) {
		return (
			<main className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold text-slate-900">Funeral Services Dashboard</h1>
					<p className="text-slate-600 mt-1">Loading...</p>
				</div>
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
										<div key={c.id} className="flex justify-between items-center p-2 border rounded">
											<div>
												<div className="font-medium text-sm">{c.title}</div>
												<div className="text-xs text-slate-500">{new Date(c.created_at).toLocaleDateString()}</div>
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
