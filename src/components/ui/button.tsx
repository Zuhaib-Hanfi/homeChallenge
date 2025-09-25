import * as React from 'react'
import clsx from 'clsx'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: 'default' | 'outline' | 'ghost'
	size?: 'sm' | 'md' | 'lg'
	asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ className, variant = 'default', size = 'md', asChild = false, ...props }, ref
) {
	const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none'
	const variants: Record<string,string> = {
		default: 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900',
		outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 focus:ring-slate-300',
		ghost: 'bg-transparent hover:bg-slate-100 text-slate-900 focus:ring-slate-300'
	}
	const sizes: Record<string,string> = {
		sm: 'h-8 px-3 text-sm',
		md: 'h-10 px-4 text-sm',
		lg: 'h-11 px-5 text-base'
	}
	const Comp = asChild ? 'div' : 'button'
	return (
		<Comp ref={ref} className={clsx(base, variants[variant], sizes[size], className)} {...props} />
	)
})
