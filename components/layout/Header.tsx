'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, ShoppingBag, Heart, Sun, Moon, Menu, X } from 'lucide-react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useBagStore } from '@/store/useBagStore'
import { useWishlistStore } from '@/store/useWishlistStore'
import { useUIStore } from '@/store/useUIStore'
import { AnimatePresence, motion } from 'framer-motion'

export default function Header() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { items: bagItems } = useBagStore()
  const { items: wishlistItems } = useWishlistStore()
  const { setBagOpen, setSearchOpen } = useUIStore()
  
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on page change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const bagCount = mounted ? bagItems.length : 0
  const wishlistCount = mounted ? wishlistItems.length : 0

  const navLinks = [
    { name: 'Shop All', href: '/shop' },
    { name: 'Collections', href: '/#collections' },
    { name: 'About', href: '/about' },
  ]

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'border-b border-border/40 bg-background/80 backdrop-blur-md'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex lg:flex-1">
            <Link href="/" className="text-xl font-bold tracking-widest text-foreground hover:opacity-80 transition-opacity">
              MINIMALIST
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium tracking-wide transition-colors relative py-1 hover:text-foreground/80 ${
                    isActive ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavBorder"
                      className="absolute bottom-0 left-0 h-[1.5px] w-full bg-foreground"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-foreground/60 hover:text-foreground transition-colors rounded-full hover:bg-secondary/80 focus:outline-none"
              aria-label="Search items"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-foreground/60 hover:text-foreground transition-colors rounded-full hover:bg-secondary/80 focus:outline-none"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="p-2 text-foreground/60 hover:text-foreground transition-colors rounded-full hover:bg-secondary/80 focus:outline-none relative"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background animate-fade-in">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Bag Button */}
            <button
              onClick={() => setBagOpen(true)}
              className="p-2 text-foreground/60 hover:text-foreground transition-colors rounded-full hover:bg-secondary/80 focus:outline-none relative"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {bagCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background animate-fade-in">
                  {bagCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-foreground/60 hover:text-foreground transition-colors rounded-full hover:bg-secondary/80 focus:outline-none md:hidden"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-30 border-b border-border bg-background px-4 py-6 md:hidden shadow-lg"
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-base font-semibold tracking-wide text-foreground/80 hover:text-foreground py-2 border-b border-border/45"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
