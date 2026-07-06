'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMock, setIsMock] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if we are running in mock mode based on env configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const forceMock = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'
    setIsMock(forceMock || !supabaseUrl || supabaseUrl.includes('your-supabase'))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      toast.error('Please enter a password')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: isMock ? 'admin@store.com' : email, password })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Authentication failed')
      }

      toast.success('Authenticated successfully')
      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center min-h-[75vh] px-4">
      <div className="w-full max-w-md border border-border/40 bg-secondary/10 p-8 rounded-md shadow-2xl backdrop-blur-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black tracking-widest uppercase text-foreground">
            Admin Access
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-foreground/45">
            {isMock ? 'Mock Store Mode Active' : 'Production Portal'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isMock && (
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase tracking-wider text-foreground/60">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-secondary/30 border border-border/30 px-3 py-2.5 text-xs text-foreground placeholder:text-foreground/35 outline-none focus:border-foreground/40 transition-all rounded-sm"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-foreground/60">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-secondary/30 border border-border/30 px-3 py-2.5 text-xs text-foreground placeholder:text-foreground/35 outline-none focus:border-foreground/40 transition-all rounded-sm"
            />
          </div>

          {isMock && (
            <div className="bg-secondary/20 border border-border/20 p-3 rounded-sm">
              <p className="text-[10px] uppercase tracking-wide text-foreground/60 leading-normal">
                💡 <span className="font-bold">Mock Mode Password:</span> use <code className="bg-secondary px-1 text-foreground">admin</code> to log in.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background text-xs font-bold uppercase tracking-widest py-3 flex items-center justify-center gap-2 hover:bg-foreground/80 transition-colors rounded-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enter Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}
