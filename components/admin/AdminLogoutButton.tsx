'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminLogoutButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    if (loading) return
    setLoading(true)

    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' })
      if (!res.ok) throw new Error('Logout failed')
      
      toast.success('Logged out successfully')
      router.push('/admin/login')
      router.refresh()
    } catch (err: any) {
      toast.error('Failed to log out')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-3 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-destructive/80 hover:text-destructive transition-colors disabled:opacity-50 text-left w-full cursor-pointer"
    >
      <LogOut className="h-3.5 w-3.5" />
      <span>{loading ? 'Leaving...' : 'Sign Out'}</span>
    </button>
  )
}
