export function Progress({ value }: { value: number }) {
	const v = Math.max(0, Math.min(100, Math.round(value)))
	return (
		<div className="w-full h-2 bg-slate-200 rounded-full">
			<div className="h-2 bg-slate-900 rounded-full transition-all duration-300" style={{ width: `${v}%` }} />
		</div>
	)
}
