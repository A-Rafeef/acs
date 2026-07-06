import { getHeroSlides } from '@/lib/data/hero-slides'
import { isAdminAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'
import BannerManager from '@/components/admin/BannerManager'

export const revalidate = 0

export default async function AdminBannerPage() {
  const isAuth = await isAdminAuthenticated()
  if (!isAuth) {
    redirect('/admin/login')
  }

  const slides = await getHeroSlides()

  return <BannerManager initialSlides={slides} />
}
