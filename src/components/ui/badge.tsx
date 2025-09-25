import * as React from 'react'
import clsx from 'clsx'

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
	return <span className={clsx('inline-block px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700', className)}>{children}</span>
}
