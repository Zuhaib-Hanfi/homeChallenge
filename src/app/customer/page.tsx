import { getSupabaseServerClient } from '@/lib/supabaseServer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function CustomerPortal() {
	const supabase = await getSupabaseServerClient()
	const { data: { user } } = await supabase.auth.getUser()
	
	if (!user) {
		return (
			<main className="space-y-4">
				<Card>
					<CardContent className="p-6 text-center">
						<h1 className="text-xl font-semibold text-slate-900 mb-2">Please sign in</h1>
						<p className="text-slate-600 mb-4">You need to be signed in to view your cases.</p>
						<Button asChild>
							<Link href="/login">Sign In</Link>
						</Button>
					</CardContent>
				</Card>
			</main>
		)
	}
	
	let cases: any[] = []
	if (user?.email) {
		const { data } = await supabase.from('cases').select('id, title, status, created_at').eq('contact_email', user.email).order('created_at', { ascending: false })
		cases = data || []
	}
	
	return (
		<main className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-slate-900">Customer Portal</h1>
				<p className="text-slate-600 mt-1">View your case status and progress</p>
			</div>
			
			{cases.length === 0 ? (
				<Card>
					<CardContent className="p-6 text-center">
						<h2 className="text-lg font-semibold text-slate-900 mb-2">No cases found</h2>
						<p className="text-slate-600">No cases are currently tied to your email address.</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 grid-cols-1 md:grid-cols-2">
					{cases.map(c => (
						<Card key={c.id} className="hover:shadow-md transition-shadow">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-lg font-semibold text-slate-900">{c.title}</CardTitle>
								<Badge className="bg-slate-100 text-slate-700">{c.status}</Badge>
							</CardHeader>
							<CardContent>
								<div className="text-sm text-slate-600 mb-3">
									Created: {new Date(c.created_at).toLocaleDateString()}
								</div>
								<Button variant="outline" size="sm" asChild>
									<Link href={`/cases/${c.id}`}>View Checklist</Link>
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</main>
	)
}
