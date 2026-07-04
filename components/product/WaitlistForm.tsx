'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { joinWaitlistAction } from '@/app/actions/waitlist'
import { toast } from 'sonner'
import { Loader2, Check } from 'lucide-react'

const waitlistSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().optional()
})

type WaitlistFormValues = z.infer<typeof waitlistSchema>

interface WaitlistFormProps {
  productId: string;
}

export default function WaitlistForm({ productId }: WaitlistFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema)
  })

  const onSubmit = async (values: WaitlistFormValues) => {
    setIsSubmitting(true)
    try {
      const res = await joinWaitlistAction(productId, values.email, values.phone)
      if (res.success) {
        setIsSubmitted(true)
        toast.success('Successfully joined the waitlist')
        reset()
      } else {
        toast.error(res.error || 'Failed to join waitlist')
      }
    } catch (err) {
      console.error(err)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="border border-border/40 p-6 text-center space-y-3 bg-secondary/15 animate-fade-in rounded-sm">
        <div className="mx-auto rounded-full bg-emerald-500/10 p-2 w-10 h-10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <Check className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider">Registered</h4>
          <p className="text-[10px] text-foreground/45">
            You will be notified immediately if this piece becomes available or a similar item drops.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-border/30 p-6 space-y-4 rounded-sm">
      <div className="space-y-1">
        <h4 className="text-xs font-bold uppercase tracking-wider">Notify Me / Waitlist</h4>
        <p className="text-[10px] text-foreground/45 leading-relaxed">
          This piece is a unique 1-of-1 and has been sold. Join the waitlist to receive alerts if it is returned, or if we source similar items in this size.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Email Input */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase tracking-wider font-bold text-foreground/50 block" htmlFor="email">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            placeholder="e.g. name@example.com"
            className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground transition-colors bg-transparent rounded-sm"
          />
          {errors.email && (
            <p className="text-[9px] text-destructive font-bold uppercase">{errors.email.message}</p>
          )}
        </div>

        {/* Phone Input */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase tracking-wider font-bold text-foreground/50 block" htmlFor="phone">
            Phone Number (Optional)
          </label>
          <input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="e.g. +234 80 1234 5678"
            className="w-full text-xs border border-border/30 p-2.5 outline-none focus:border-foreground transition-colors bg-transparent rounded-sm"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-foreground text-background text-xs font-bold uppercase tracking-widest py-3 flex items-center justify-center gap-2 hover:bg-foreground/80 transition-colors rounded-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" /> Submitting
            </>
          ) : (
            'Notify Me'
          )}
        </button>
      </form>
    </div>
  )
}
