'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, FolderOpen, Tags, LogOut, Loader2, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Verify if we are running in local mock mode
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const forceMock = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'
  const isMock = forceMock || !supabaseUrl || supabaseUrl.includes('your-supabase')

  useEffect(() => {
    const checkUser = async () => {
      if (isMock) {
        setUser({ email: 'admin@example.com' })
        setLoading(false)
        return
      }
      
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    checkUser()
  }, [supabase, isMock])

  // Close mobile sidebar on route changes
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    try {
      if (isMock) {
        document.cookie = 'mock-admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;'
        toast.success('Signed out successfully')
        router.push('/admin/login')
        router.refresh()
        return
      }

      await supabase.auth.signOut()
      toast.success('Signed out successfully')
      router.push('/admin/login')
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error('Failed to sign out')
    }
  }

  if (loading && pathname !== '/admin/login') {
    return (
      <div className="flex h-[75vh] w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-foreground/45" />
      </div>
    )
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const sideLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
    { name: 'Brands', href: '/admin/brands', icon: Tags },
  ]

  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'MINIMALIST THRIFT'

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-secondary/15 border-r border-border/40">
      {/* Brand header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-border/40">
        <Link href="/admin/dashboard" className="text-sm font-bold uppercase tracking-widest text-foreground">
          {storeName} Admin
        </Link>
        {/* Mobile close button inside header */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1 text-foreground/60 hover:text-foreground hover:bg-secondary rounded"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {sideLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors ${
                isActive
                  ? 'bg-foreground text-background font-bold'
                  : 'text-foreground/60 hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{link.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Info & Logout block */}
      <div className="p-4 border-t border-border/40 space-y-3 bg-secondary/5">
        {user && (
          <div className="px-3 min-w-0">
            <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-bold">Logged In As</p>
            <p className="text-[11px] font-medium text-foreground truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-destructive hover:bg-destructive/10 rounded-sm transition-colors text-left"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative">
      {/* Mobile Top Header */}
      <header className="flex md:hidden items-center justify-between px-4 h-16 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-30 w-full">
        <Link href="/admin/dashboard" className="text-xs font-bold uppercase tracking-widest text-foreground">
          {storeName} Admin
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-foreground/60 hover:text-foreground hover:bg-secondary rounded"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Backdrop (Mobile overlay only) */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar - Desktop static */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        <Sidebar />
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-background transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </aside>

      {/* Content wrapper */}
      <div className="flex flex-col flex-1 min-h-screen md:pl-64">
        <main className="flex-grow p-4 sm:p-8 md:p-10 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
