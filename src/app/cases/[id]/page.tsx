'use client'

import { useEffect, useMemo, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import {use} from 'react'
export default function CaseChecklistPage({ params }: { params: { id: string }}) {
	const supabase = getSupabaseBrowserClient()
    const {id} = use(params)
	const caseId = id
	const [items, setItems] = useState<any[]>([])
	const [title, setTitle] = useState<string>('')
	const [user, setUser] = useState<any>(null)
	const [userRole, setUserRole] = useState<string>('')
	const [newItemTitle, setNewItemTitle] = useState('')
	const [showAddForm, setShowAddForm] = useState(false)

	function formatDateTimeISO(dateStr: string | null): string {
		if (!dateStr) return ''
		try {
			const d = new Date(dateStr)
			return d.toISOString().replace('T', ' ').slice(0, 16)
		} catch {
			return ''
		}
	}

	async function load() {
		const { data: { user } } = await supabase.auth.getUser()
		setUser(user)
		
		if (user) {
			const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
			setUserRole(profile?.role || 'customer')
		}

		const { data: checklist } = await supabase.from('checklists').select('id').eq('case_id', caseId).single()
		if (!checklist) return
		const { data: items } = await supabase.from('checklist_items').select('*').eq('checklist_id', checklist.id).order('title')
		setItems(items || [])
		const { data: cases } = await supabase.from('cases').select('title').eq('id', caseId).single()
		setTitle(cases?.title ?? '')
	}

	useEffect(() => { load() }, [caseId])

	const progress = useMemo(() => {
		if (!items.length) return 0
		const done = items.filter(i => i.is_complete).length
		return (done / items.length) * 100
	}, [items])

	const canComplete = userRole && ['admin', 'director', 'manager'].includes(userRole)
	const canAddItems = userRole && ['admin', 'director', 'manager', 'customer'].includes(userRole)

	async function toggle(item: any) {
		if (!canComplete) return
		await supabase.from('checklist_items').update({ is_complete: !item.is_complete, completed_at: !item.is_complete ? new Date().toISOString() : null }).eq('id', item.id)
		load()
	}

	async function addItem() {
		if (!newItemTitle.trim() || !canAddItems) return
		const { data: checklist } = await supabase.from('checklists').select('id').eq('case_id', caseId).single()
		if (!checklist) return
		
		await supabase.from('checklist_items').insert({
			checklist_id: checklist.id,
			title: newItemTitle.trim(),
			assigned_to: user?.id
		})
		setNewItemTitle('')
		setShowAddForm(false)
		load()
	}

	return (
		<main className="p-0 animate-fade-in-up">
			<Card>
				<CardHeader>
					<CardTitle>Checklist — {title}</CardTitle>
					<div className="mt-2">
						<Progress value={progress} />
						<div className="text-xs text-slate-600 mt-1">{Math.round(progress)}% complete</div>
					</div>
					{canAddItems && (
						<div className="mt-4">
							{!showAddForm ? (
								<Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
									Add custom item
								</Button>
							) : (
								<div className="flex gap-2">
									<Input
										placeholder="New checklist item"
										value={newItemTitle}
										onChange={(e) => setNewItemTitle(e.target.value)}
										onKeyDown={(e) => e.key === 'Enter' && addItem()}
									/>
									<Button size="sm" onClick={addItem} disabled={!newItemTitle.trim()}>
										Add
									</Button>
									<Button variant="outline" size="sm" onClick={() => { setShowAddForm(false); setNewItemTitle('') }}>
										Cancel
									</Button>
								</div>
							)}
						</div>
					)}
				</CardHeader>
				<CardContent>
					<div className="divide-y divide-slate-200">
						{items.map((it) => (
							<div key={it.id} className="py-3 flex items-center justify-between animate-fade-in-up">
								<div className="flex items-center gap-3">
									<input 
										type="checkbox" 
										checked={it.is_complete} 
										onChange={() => toggle(it)} 
										disabled={!canComplete}
										className="h-4 w-4 text-slate-900 focus:ring-slate-900 disabled:opacity-50" 
									/>
									<div>
										<div className="font-medium text-slate-900">{it.title}</div>
										<div className="text-xs text-slate-500">{it.completed_at ? formatDateTimeISO(it.completed_at) : 'Not completed'}</div>
									</div>
								</div>
								{canComplete && (
									<Button variant="outline" size="sm" onClick={() => toggle(it)}>
										{it.is_complete ? 'Mark undone' : 'Mark done'}
									</Button>
								)}
								{!canComplete && userRole === 'customer' && (
									<span className="text-xs text-slate-500">Only team members can complete tasks</span>
								)}
							</div>
						))}
						{!items.length && <div className="py-6 text-sm text-slate-600">No checklist items yet.</div>}
					</div>
				</CardContent>
			</Card>
		</main>
	)
}
