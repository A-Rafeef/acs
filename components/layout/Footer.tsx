import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+1234567890'
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'MINIMALIST THRIFT'

  return (
    <footer className="mt-auto border-t border-border/40 bg-background py-12 text-foreground/60 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand block */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-sm font-bold tracking-widest text-foreground">
              {storeName.toUpperCase()}
            </h3>
            <p className="max-w-sm text-xs leading-relaxed">
              Curating rare, vintage, and high-quality 1-of-1 garments. Focused on sustainability, circular fashion, and premium minimalist aesthetics.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shop" className="hover:text-foreground transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/#collections" className="hover:text-foreground transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-foreground transition-colors">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service / Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Contact
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors font-medium text-foreground/80"
                >
                  WhatsApp Support
                </a>
              </li>
              <li>
                <Link href="/#about" className="hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <span className="block text-[11px] text-foreground/40">
                  Business hours: 9AM - 6PM
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-border/25 pt-6 text-[10px] sm:flex-row">
          <p>© {currentYear} {storeName}. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 text-foreground/40">
            Designed for eco-conscious luxury.
          </p>
        </div>
      </div>
    </footer>
  )
}
