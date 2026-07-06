import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BagDrawer from '@/components/bag/BagDrawer'
import CommandPalette from '@/components/search/CommandPalette'
import WhatsAppFloat from '@/components/layout/WhatsAppFloat'
import PageTransition from '@/components/providers/PageTransition'

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <BagDrawer />
      <CommandPalette />
      <WhatsAppFloat />
    </>
  )
}
