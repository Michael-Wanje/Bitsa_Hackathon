"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)
  }, [])

  const navItems = [
    { label: "Events", href: "/events" },
    { label: "Blog", href: "/blog" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
  ]

  return (
    <nav
      className={`w-full z-50 transition-all duration-300 ${isScrolled ? "glass shadow-lg shadow-primary/20" : "bg-background/50 backdrop-blur-md"} border-b border-border/50`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto">
        <div className="flex items-center justify-between h-16 min-w-[600px]">
          {/* CHANGE: Enhanced logo with gradient and hover effect */}
          <Link href="/" className="flex items-center group">
            <img
              src="/bitsa_logo.jpg"
              alt="BITSA Logo"
              className="w-10 h-10 rounded-lg object-contain transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/50"
            />
          </Link>

          {/* Desktop Menu - Centered & Responsive */}
          <div className="hidden md:flex items-center justify-center space-x-1 flex-1 mx-4 min-w-0">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-all duration-300 relative group whitespace-nowrap shrink-0 focus:outline-none focus:ring-2 focus:ring-primary"
                tabIndex={0}
              >
                {item.label}
                <span className="absolute bottom-1 left-3 w-0 h-0.5 bg-primary group-hover:w-[calc(100%-24px)] transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button (Drawer) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-muted transition-all duration-300"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          {/* Auth Buttons & Theme Toggle for Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="hover:text-primary transition-all duration-300">
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    localStorage.removeItem("token")
                    localStorage.removeItem("user")
                    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
                    window.location.href = "/auth/login"
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="hover:text-primary transition-all duration-300">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="btn-primary">
                    Register
                  </Button>
                </Link>
              </>
            )}
            {/* Theme Toggle for Desktop */}
            <div className="flex gap-1 ml-4">
              <button className="px-2 py-1 rounded bg-muted text-foreground hover:bg-primary/10" onClick={() => document.documentElement.setAttribute('data-theme', 'system')}>System</button>
              <button className="px-2 py-1 rounded bg-muted text-foreground hover:bg-primary/10" onClick={() => document.documentElement.setAttribute('data-theme', 'light')}>Light</button>
              <button className="px-2 py-1 rounded bg-muted text-foreground hover:bg-primary/10" onClick={() => document.documentElement.setAttribute('data-theme', 'dark')}>Dark</button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-muted transition-all duration-300"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Drawer Sidebar - Right, Opaque, Full Height */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed right-0 top-0 h-full w-72 bg-background border-l border-border shadow-lg flex flex-col pt-8 px-4 animate-in slide-in-from-right duration-300">
              <button
                onClick={() => setIsOpen(false)}
                className="self-end mb-4 p-2 rounded-md text-foreground hover:bg-muted transition-all duration-300"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-all duration-300 mb-2"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-2">
                {isLoggedIn ? (
                  <>
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        Dashboard
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        localStorage.removeItem("token")
                        localStorage.removeItem("user")
                        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
                        window.location.href = "/auth/login"
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                      <Button size="sm" className="btn-primary w-full">
                        Register
                      </Button>
                    </Link>
                  </>
                )}
              </div>
              {/* Theme Toggle at Bottom */}
              <div className="mt-auto pt-6 pb-2 flex justify-center gap-2 border-t border-border">
                <button className="px-3 py-2 rounded-lg bg-muted text-foreground hover:bg-primary/10" onClick={() => document.documentElement.setAttribute('data-theme', 'system')}>System</button>
                <button className="px-3 py-2 rounded-lg bg-muted text-foreground hover:bg-primary/10" onClick={() => document.documentElement.setAttribute('data-theme', 'light')}>Light</button>
                <button className="px-3 py-2 rounded-lg bg-muted text-foreground hover:bg-primary/10" onClick={() => document.documentElement.setAttribute('data-theme', 'dark')}>Dark</button>
              </div>
            </div>
            <div className="flex-1 bg-black/30" onClick={() => setIsOpen(false)}></div>
          </div>
        )}
      </div>
    </nav>
  )
}
