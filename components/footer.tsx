"use client"

import Link from "next/link"
import { Mail, Phone, Linkedin, Github, Twitter, ArrowUp } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="relative bg-gradient-to-b from-background via-background to-primary/10 text-foreground py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-border/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
          <div className="group">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="/bitsa_logo.jpg"
                alt="BITSA Logo"
                className="w-10 h-10 rounded-lg object-contain transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/50"
              />
              <h3 className="font-bold text-lg text-primary">BITSA</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed hover:text-foreground transition-colors duration-300">
              Bachelor of Information Technology Students Association at UEAB. Connecting tech enthusiasts and fostering
              innovation through community-driven initiatives.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground text-sm">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Events", href: "/events" },
                { label: "Blog", href: "/blog" },
                { label: "Gallery", href: "/gallery" },
                { label: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center gap-2 group/link"
                  >
                    <span className="w-0 h-0.5 bg-primary group-hover/link:w-4 transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground text-sm">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2 group/item">
                <Mail
                  size={16}
                  className="mt-0.5 text-primary group-hover/item:text-secondary transition-colors duration-300 flex-shrink-0"
                />
                <a
                  href="mailto:bitsaclub@ueab.ac.ke"
                  className="text-muted-foreground hover:text-primary transition-colors duration-300 break-all"
                >
                  bitsaclub@ueab.ac.ke
                </a>
              </li>
              <li className="flex items-start space-x-2 group/item">
                <Phone
                  size={16}
                  className="mt-0.5 text-primary group-hover/item:text-secondary transition-colors duration-300 flex-shrink-0"
                />
                <span className="text-muted-foreground group-hover/item:text-primary transition-colors duration-300 text-xs sm:text-sm">
                  President: +254 708 898 899
                </span>
              </li>
              <li className="flex items-start space-x-2 group/item">
                <Phone
                  size={16}
                  className="mt-0.5 text-secondary group-hover/item:text-primary transition-colors duration-300 flex-shrink-0"
                />
                <span className="text-muted-foreground group-hover/item:text-secondary transition-colors duration-300 text-xs sm:text-sm">
                  VP: +254 725 486 687
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground text-sm">Follow Us</h4>
            <div className="flex items-center space-x-4">
              {[
                { icon: Github, label: "GitHub", href: "#" },
                { icon: Linkedin, label: "LinkedIn", href: "#" },
                { icon: Twitter, label: "Twitter", href: "#" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-lg backdrop-blur-md bg-white/10 border border-white/20 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 group/social"
                >
                  <social.icon size={20} className="transition-transform group-hover/social:scale-110" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-muted-foreground gap-6 sm:gap-0">
          <p>&copy; {currentYear} BITSA. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link href="#" className="hover:text-primary transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-primary transition-colors duration-300">
              Terms of Service
            </Link>
            <button
              onClick={scrollToTop}
              className="w-10 h-10 rounded-lg backdrop-blur-md bg-white/10 border border-white/20 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 group/top"
            >
              <ArrowUp
                size={18}
                className="transition-transform group-hover/top:scale-110 group-hover/top:-translate-y-0.5"
              />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
