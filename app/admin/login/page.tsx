'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Lock } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

type LoginFormValues = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  })

  // Check if mock mode is running
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const forceMock = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'
  const isMock = forceMock || !supabaseUrl || supabaseUrl.includes('your-supabase')

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true)
    try {
      if (isMock) {
        if (values.email === 'adilshop@rafi.com' && values.password === 'adilismail.in') {
          document.cookie = 'mock-admin-session=true; path=/; max-age=86400;'
          toast.success('Authenticated successfully (Mock Dev Bypassed)')
          const redirectUrl = searchParams.get('next') || '/admin/dashboard'
          router.push(redirectUrl)
          router.refresh()
        } else {
          toast.error('Invalid email or password (Mock Mode)')
        }
        return
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password
      })

      if (error) {
        toast.error(error.message || 'Invalid email or password')
      } else {
        toast.success('Successfully authenticated')
        
        // Redirect to intended route or default to dashboard
        const redirectUrl = searchParams.get('next') || '/admin/dashboard'
        router.push(redirectUrl)
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      toast.error('An error occurred during authentication')
    } finally {
      setLoading(false)
    }
  }

  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'MINIMALIST THRIFT'

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 border border-border/30 p-8 bg-secondary/10 rounded-sm">
        {/* Brand Lock */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="rounded-full bg-foreground text-background p-3">
            <Lock className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">
              {storeName} Admin
            </h2>
            <p className="text-[10px] uppercase text-foreground/45 tracking-wider font-semibold">
              Restricted Area Access {isMock && '(MOCK ACTIVE)'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Info note for local testing */}
          {isMock && (
            <div className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-3 rounded-sm leading-relaxed border border-amber-500/20">
              <strong>Local Mock Mode Active:</strong> Sign in using <code>adilshop@rafi.com</code> / <code>adilismail.in</code>.
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider font-bold text-foreground/50 block" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              placeholder="admin@example.com"
              className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground transition-colors bg-background rounded-sm text-foreground"
            />
            {errors.email && (
              <p className="text-[9px] text-destructive font-bold uppercase">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider font-bold text-foreground/50 block" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground transition-colors bg-background rounded-sm text-foreground"
            />
            {errors.password && (
              <p className="text-[9px] text-destructive font-bold uppercase">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background text-xs font-bold uppercase tracking-widest py-3 flex items-center justify-center gap-2 hover:bg-foreground/80 transition-colors rounded-sm mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" /> Authenticating
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[75vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-foreground/45" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
