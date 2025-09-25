import { getSupabaseServerClient } from '@/lib/supabaseServer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function TeamPage() {
	const supabase = await getSupabaseServerClient()
	const { data: profiles } = await supabase.from('profiles').select('id, full_name, role, created_at').order('created_at', { ascending: true })
	return (
		<main className="p-0">
			<Card>
				<CardHeader>
					<CardTitle>Team</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-auto rounded-md border border-slate-200">
						<table className="w-full text-sm">
							<thead className="bg-slate-50">
								<tr>
									<th className="text-left p-3 font-medium text-slate-900">Name</th>
									<th className="text-left p-3 font-medium text-slate-900">Role</th>
									<th className="text-left p-3 font-medium text-slate-900">User ID</th>
								</tr>
							</thead>
							<tbody>
								{profiles?.map((p: any) => (
									<tr key={p.id} className="border-t border-slate-200 hover:bg-slate-50">
										<td className="p-3 text-slate-900">{p.full_name || '—'}</td>
										<td className="p-3"><Badge>{p.role}</Badge></td>
										<td className="p-3 text-slate-500 text-xs">{p.id}</td>
									</tr>
								))}
								{!profiles?.length && (
									<tr><td className="p-6 text-slate-600 text-center" colSpan={3}>No team members yet.</td></tr>
								)}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</main>
	)
}
