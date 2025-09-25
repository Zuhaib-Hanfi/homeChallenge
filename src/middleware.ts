import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login','/signup','/favicon.ico','/robots.txt']

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl
	const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
	if (isPublic || pathname.startsWith('/_next')) return NextResponse.next()

	// Supabase sets cookies like sb-<project-ref>-auth-token and sb-<project-ref>-auth-refresh-token
	const hasAuth = Array.from(request.cookies.getAll()).some(c => c.name.includes('-auth-token'))
	if (!hasAuth) {
		const url = request.nextUrl.clone()
		url.pathname = '/login'
		url.searchParams.set('redirectedFrom', pathname)
		return NextResponse.redirect(url)
	}
	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|public).*)']
}
