'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabaseClient'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          router.push('/login')
          return
        }
        
        setIsChecking(false)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      }
    }
    
    checkAuth()
  }, [router])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <Dashboard />
}