// app/login/page.tsx
'use client'

import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
