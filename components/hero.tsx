"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export default function Hero() {
  const countRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // CHANGE: Animate counters on scroll into view
          const animateCounter = (element: Element, target: number) => {
            let current = 0
            const increment = target / 30
            const timer = setInterval(() => {
              current += increment
              if (current >= target) {
                current = target
                clearInterval(timer)
              }
              element.textContent = Math.floor(current).toString()
            }, 50)
          }

          const stats = countRef.current?.querySelectorAll("[data-count]")
          stats?.forEach((stat) => {
            const target = Number.parseInt(stat.getAttribute("data-count") || "0")
            animateCounter(stat, target)
          })
        }
      },
      { threshold: 0.1 },
    )

    if (countRef.current) {
      observer.observe(countRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 sm:px-6">
      {/* CHANGE: Enhanced dynamic gradient background with animations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-72 sm:w-96 h-72 sm:h-96 bg-linear-to-b from-primary/30 to-transparent rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-20 left-20 w-72 sm:w-96 h-72 sm:h-96 bg-linear-to-t from-secondary/20 to-transparent rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 -right-32 w-72 sm:w-80 h-72 sm:h-80 bg-linear-to-l from-accent/10 to-transparent rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* CHANGE: Animated grid overlay for depth */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.02)_1px,transparent_1px)] bg-size-[2rem_2rem] sm:bg-size-[4rem_4rem] opacity-50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* CHANGE: Enhanced badge with animation */}
        <div className="inline-flex items-center space-x-2 mb-6 px-4 py-2 rounded-full glass animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
          <span className="text-xs sm:text-sm font-semibold text-primary">Join 500+ Members Today</span>
        </div>

        {/* CHANGE: Cinematic hero title with staggered reveal */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both"
          style={{ animationDelay: "100ms" }}
        >
          Where <span className="text-primary">deep tech</span> meets <span className="text-accent">a human</span>{" "}
          mindset
        </h1>

        {/* CHANGE: Enhanced description with better typography */}
        <p
          className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both px-2"
          style={{ animationDelay: "200ms" }}
        >
          Join the Bachelor of Information Technology Students Association at UEAB. Connect with passionate developers,
          attend exclusive events, and grow your tech skills with a community that cares about your success.
        </p>

        {/* CHANGE: Enhanced CTA buttons with better interactions */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 fill-mode-both px-2"
          style={{ animationDelay: "300ms" }}
        >
          <Link href="/auth/register" className="w-full sm:w-auto">
            <Button size="lg" className="btn-primary group w-full sm:w-auto">
              Get Started
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/events" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="glass group bg-transparent w-full sm:w-auto">
              <Play className="mr-2 w-4 h-4" />
              Explore Events
            </Button>
          </Link>
        </div>

        {/* CHANGE: Enhanced stats with counter animations */}
        <div
          ref={countRef}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-12 sm:mt-16 pt-8 sm:pt-16 border-t border-border/30"
        >
          <div className="glass p-4 sm:p-6 rounded-xl group hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
            <div className="text-3xl sm:text-4xl font-bold text-primary">
              <span data-count="500">0</span>+
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-2">Active Members</div>
          </div>
          <div className="glass p-4 sm:p-6 rounded-xl group hover:shadow-lg hover:shadow-secondary/20 transition-all duration-300">
            <div className="text-3xl sm:text-4xl font-bold text-secondary">
              <span data-count="50">0</span>+
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-2">Events Yearly</div>
          </div>
          <div className="glass p-4 sm:p-6 rounded-xl group hover:shadow-lg hover:shadow-accent/20 transition-all duration-300">
            <div className="text-3xl sm:text-4xl font-bold text-accent">
              <span data-count="100">0</span>%
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-2">Tech Focused</div>
          </div>
        </div>
      </div>
    </section>
  )
}
