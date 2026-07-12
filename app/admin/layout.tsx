import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/auth'
import { LayoutDashboard, ShoppingBag, LogOut, ArrowLeft, Users, Layers } from 'lucide-react'
import AdminLogoutButton from '@/components/admin/AdminLogoutButton'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const isAuth = await isAdminAuthenticated()

  // If not authenticated, we just render the child (e.g. login page)
  if (!isAuth) {
    return <div className="min-h-screen bg-background flex flex-col">{children}</div>
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row border-t border-border/25">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border/20 p-6 flex flex-col justify-between space-y-8 bg-secondary/5">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider">Store Admin</h2>
              <span className="text-[9px] font-bold text-foreground/45 uppercase tracking-widest">
                ACS Control
              </span>
            </div>
            <Link
              href="/"
              className="p-1.5 rounded-full hover:bg-secondary text-foreground/60 hover:text-foreground transition-colors md:hidden"
              title="View Storefront"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider text-foreground/70 hover:text-foreground hover:bg-secondary/40 rounded-sm transition-all whitespace-nowrap"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider text-foreground/70 hover:text-foreground hover:bg-secondary/40 rounded-sm transition-all whitespace-nowrap"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Inventory</span>
            </Link>
            <Link
              href="/admin/waitlist"
              className="flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider text-foreground/70 hover:text-foreground hover:bg-secondary/40 rounded-sm transition-all whitespace-nowrap"
            >
              <Users className="h-4 w-4" />
              <span>Waitlist</span>
            </Link>
            <Link
              href="/admin/banner"
              className="flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider text-foreground/70 hover:text-foreground hover:bg-secondary/40 rounded-sm transition-all whitespace-nowrap"
            >
              <Layers className="h-4 w-4" />
              <span>Banner</span>
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex flex-col gap-4 border-t border-border/20 pt-6">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground/45 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Storefront</span>
          </Link>
          
          <AdminLogoutButton />
        </div>
      </aside>

      {/* Main Admin Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  )
}
