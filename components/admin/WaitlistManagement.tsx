'use client'

import { useState } from 'react'
import { Search, Copy, Check, Trash2, ArrowLeft, RefreshCw, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface WaitlistEntry {
  id: string
  product_id: string
  email: string
  phone: string | null
  created_at: string
  product?: {
    title: string
    slug: string
  } | null
}

interface WaitlistManagementProps {
  initialWaitlist: WaitlistEntry[]
}

export default function WaitlistManagement({ initialWaitlist }: WaitlistManagementProps) {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(initialWaitlist)
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  // Filter waitlist entries
  const filteredWaitlist = waitlist.filter((entry) => {
    return (
      entry.email.toLowerCase().includes(search.toLowerCase()) ||
      (entry.phone && entry.phone.includes(search)) ||
      (entry.product?.title && entry.product.title.toLowerCase().includes(search.toLowerCase()))
    )
  })

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success('Email copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to remove waitlist request for "${email}"?`)) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/waitlist/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to remove waitlist entry')
      }

      toast.success('Waitlist request removed')
      setWaitlist((prev) => prev.filter((entry) => entry.id !== id))
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete waitlist entry')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/25 pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wide">
            Waitlist Inquiries
          </h1>
          <p className="text-[10px] text-foreground/45 uppercase tracking-widest font-bold">
            Manage customer requests for sold-out pieces ({filteredWaitlist.length} entries)
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full md:max-w-xs">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search waitlist..."
          className="w-full bg-secondary/20 border border-border/25 px-3 py-2.5 pl-9 text-xs text-foreground placeholder:text-foreground/35 outline-none focus:border-foreground/40 transition-all rounded-sm"
        />
        <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-foreground/40" />
      </div>

      {/* Waitlist List */}
      <div className="border border-border/15 rounded-sm overflow-hidden bg-secondary/5">
        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/20 bg-secondary/20 text-[9px] font-black uppercase tracking-widest text-foreground/50">
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Phone</th>
                <th className="py-4 px-6">Requested Drop</th>
                <th className="py-4 px-6">Date Added</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10 text-xs">
              {filteredWaitlist.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-foreground/45 uppercase font-bold tracking-widest">
                    No waitlist inquiries found
                  </td>
                </tr>
              ) : (
                filteredWaitlist.map((entry) => (
                  <tr key={entry.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="py-4 px-6 font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>{entry.email}</span>
                        <button
                          onClick={() => handleCopy(entry.id, entry.email)}
                          className="p-1 text-foreground/45 hover:text-foreground transition-colors cursor-pointer"
                          title="Copy Email"
                        >
                          {copiedId === entry.id ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-foreground/60">
                      {entry.phone ? (
                        <span className="font-mono">{entry.phone}</span>
                      ) : (
                        <span className="text-[10px] text-foreground/35 uppercase font-medium">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-bold uppercase tracking-wide">
                      {entry.product ? (
                        <a
                          href={`/shop/${entry.product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline underline-offset-2 flex items-center gap-1.5"
                        >
                          {entry.product.title}
                        </a>
                      ) : (
                        <span className="text-destructive/80 text-[10px] font-semibold uppercase">Deleted product</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-foreground/50">
                      {new Date(entry.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(entry.id, entry.email)}
                        disabled={deletingId === entry.id}
                        className="p-2 text-foreground/40 hover:text-destructive hover:bg-destructive/5 rounded-sm transition-colors disabled:opacity-50 cursor-pointer"
                        title="Remove Entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden divide-y divide-border/10">
          {filteredWaitlist.length === 0 ? (
            <div className="py-12 text-center text-foreground/45 uppercase font-bold tracking-widest text-xs">
              No waitlist inquiries found
            </div>
          ) : (
            filteredWaitlist.map((entry) => (
              <div key={entry.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-bold text-xs uppercase tracking-wider">{entry.email}</p>
                    {entry.phone && (
                      <p className="text-[10px] text-foreground/60 flex items-center gap-1 font-mono">
                        <Phone className="h-3 w-3" /> {entry.phone}
                      </p>
                    )}
                  </div>
                  <span className="text-[9px] font-semibold text-foreground/45">
                    {new Date(entry.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="bg-secondary/20 p-2.5 rounded-sm border border-border/10 text-xs">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-foreground/45 block">
                    Requested drop
                  </span>
                  <span className="font-bold uppercase text-[10px]">
                    {entry.product ? entry.product.title : 'Deleted product'}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border/5">
                  <button
                    onClick={() => handleCopy(entry.id, entry.email)}
                    className="inline-flex items-center gap-1.5 border border-border/30 hover:border-foreground/30 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm transition-colors cursor-pointer"
                  >
                    {copiedId === entry.id ? (
                      <>
                        <Check className="h-3 w-3 text-green-500" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy Email
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id, entry.email)}
                    disabled={deletingId === entry.id}
                    className="p-1.5 border border-border/30 rounded-sm hover:bg-destructive/10 hover:text-destructive text-foreground/40 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
