import { adminGetWaitlist } from '@/lib/data/waitlist'
import { isAdminAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'
import WaitlistManagement from '@/components/admin/WaitlistManagement'

export const revalidate = 0

export default async function AdminWaitlistPage() {
  const isAuth = await isAdminAuthenticated()
  if (!isAuth) {
    redirect('/admin/login')
  }

  const waitlist = await adminGetWaitlist()

  return <WaitlistManagement initialWaitlist={waitlist} />
}
