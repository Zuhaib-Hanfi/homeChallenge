import * as React from 'react'
import clsx from 'clsx'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
	return <input ref={ref} className={clsx('w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent', className)} {...props} />
})

export function Label({ className, children, htmlFor }: { className?: string; children: React.ReactNode; htmlFor?: string }) {
	return (
		<label htmlFor={htmlFor} className={clsx('block text-sm font-medium text-slate-700 mb-1', className)}>
			{children}
		</label>
	)
}
