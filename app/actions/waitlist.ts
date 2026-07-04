'use server'

import { addToWaitlist as addToWaitlistData } from '@/lib/data/waitlist'

export async function joinWaitlistAction(
  productId: string, 
  email: string, 
  phone?: string
) {
  try {
    return await addToWaitlistData(productId, email, phone)
  } catch (err: any) {
    console.error('Waitlist server action error:', err)
    return { success: false, error: err.message || 'Server action failed' }
  }
}
