'use client'

import { useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SignupPage() {
	const router = useRouter()
	const supabase = getSupabaseBrowserClient()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [fullName, setFullName] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [info, setInfo] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setLoading(true)
		setError(null)
		setInfo(null)
		if (password.length < 6) {
			setLoading(false)
			setError('Password must be at least 6 characters')
			return
		}
		const { data, error } = await supabase.auth.signUp({ email, password })
		if (error) {
			setLoading(false)
			setError(error.message)
			return
		}
		const userId = data.user?.id
		if (userId) {
			const { error: insertErr } = await supabase.from('profiles').insert({ id: userId, full_name: fullName })
			if (insertErr) {
				setLoading(false)
				setError(insertErr.message)
				return
			}
		}
		setLoading(false)
		if (data.user && !data.user.confirmed_at) {
			setInfo('Check your email to confirm your account, then sign in.')
			return
		}
		router.push('/')
	}

	return (
		<div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>Create account</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={onSubmit} className="space-y-4">
						<div>
							<Label>Full name</Label>
							<Input placeholder="Full name" value={fullName} onChange={e => setFullName(e.target.value)} required />
						</div>
						<div>
							<Label>Email</Label>
							<Input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
						</div>
						<div>
							<Label>Password</Label>
							<Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
						</div>
						{error && <p className="text-sm text-red-600">{error}</p>}
						{info && <p className="text-sm text-green-700">{info}</p>}
						<Button disabled={loading} className="w-full">{loading ? 'Creating…' : 'Sign up'}</Button>
					</form>
					<p className="text-sm mt-4">Have an account? <a className="underline" href="/login">Sign in</a></p>
				</CardContent>
			</Card>
		</div>
	)
}
