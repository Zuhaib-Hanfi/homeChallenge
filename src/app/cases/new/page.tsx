'use client'

import { useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function NewCasePage() {
	const router = useRouter()
	const supabase = getSupabaseBrowserClient()
	const [title, setTitle] = useState('')
	const [clientName, setClientName] = useState('')
	const [email, setEmail] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setLoading(true)
		setError(null)
		const { data, error } = await supabase.rpc('create_case_with_checklist', { p_title: title, p_client_name: clientName, p_contact_email: email || null })
		setLoading(false)
		if (error) { setError(error.message); return }
		if (data) router.push(`/cases/${data}`)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>New Case</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={onSubmit} className="max-w-md space-y-4">
					<div>
						<Label>Case title</Label>
						<Input placeholder="e.g., Smith Family — Direct Cremation" value={title} onChange={e => setTitle(e.target.value)} required />
					</div>
					<div>
						<Label>Client name</Label>
						<Input placeholder="Client name" value={clientName} onChange={e => setClientName(e.target.value)} required />
					</div>
					<div>
						<Label>Contact email (customer)</Label>
						<Input placeholder="Optional customer email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
					</div>
					{error && <p className="text-sm text-red-600">{error}</p>}
					<Button disabled={loading} type="submit">{loading ? 'Creating…' : 'Create case'}</Button>
				</form>
			</CardContent>
		</Card>
	)
}
