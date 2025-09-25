import * as React from 'react'
import clsx from 'clsx'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={clsx(
				'rounded-xl border shadow-sm transition-all hover:shadow-lg animate-scale-in',
				'bg-white/70 supports-[backdrop-filter]:bg-white/60 backdrop-blur-md',
				'border-white/40',
				className
			)}
			{...props}
		/>
	)
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={clsx('p-4 border-b border-white/40', className)} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={clsx('p-4', className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
	return <h2 className={clsx('text-lg font-semibold text-slate-900', className)} {...props} />
}
