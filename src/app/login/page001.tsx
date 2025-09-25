//this is unused file


// 'use client'

// import { useState } from 'react'
// import { getSupabaseBrowserClient } from '@/lib/supabaseClient'
// import { useRouter, useSearchParams } from 'next/navigation'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Input, Label } from '@/components/ui/input'
// import { Button } from '@/components/ui/button'

// export default function LoginPage() {
// 	const router = useRouter()
// 	const search = useSearchParams()
// 	const supabase = getSupabaseBrowserClient()
// 	const [email, setEmail] = useState('')
// 	const [password, setPassword] = useState('')
// 	const [error, setError] = useState<string | null>(null)
// 	const [loading, setLoading] = useState(false)

// 	async function onSubmit(e: React.FormEvent) {
// 		e.preventDefault()
// 		setLoading(true)
// 		setError(null)
// 		const { error } = await supabase.auth.signInWithPassword({ email, password })
// 		setLoading(false)
// 		if (error) { setError(error.message); return }
// 		const back = search.get('redirectedFrom') || '/'
// 		router.replace(back)
// 	}

// 	return (
// 		<div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-4">
// 			<Card className="w-full max-w-sm">
// 				<CardHeader>
// 					<CardTitle>Sign in</CardTitle>
// 				</CardHeader>
// 				<CardContent>
// 					<form onSubmit={onSubmit} className="space-y-4">
// 						<div>
// 							<Label>Email</Label>
// 							<Input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
// 						</div>
// 						<div>
// 							<Label>Password</Label>
// 							<Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
// 						</div>
// 						{error && <p className="text-sm text-red-600">{error}</p>}
// 						<Button disabled={loading} className="w-full">{loading ? 'Signing in…' : 'Sign in'}</Button>
// 					</form>
// 					<p className="text-sm mt-4">No account? <a className="underline" href="/signup">Sign up</a></p>
// 				</CardContent>
// 			</Card>
// 		</div>
// 	)
// }
