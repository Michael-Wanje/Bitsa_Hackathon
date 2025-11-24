"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"
import { api } from "@/lib/api"

export default function Hero() {
  const countRef = useRef<HTMLDivElement>(null)
  const [stats, setStats] = useState({
    members: 0,
    events: 0,
    blogs: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('🔵 Fetching stats from API...')
        const response = await api.stats.getPublic()
        console.log('🔵 Stats API response:', response)
        if (response.success && response.data) {
          console.log('🔵 Setting stats:', {
            members: response.data.totalUsers,
            events: response.data.totalEvents,
            blogs: response.data.totalBlogs,
          })
          setStats({
            members: response.data.totalUsers || 0,
            events: response.data.totalEvents || 0,
            blogs: response.data.totalBlogs || 0,
          })
        } else {
          console.error('🔴 Response missing success or data:', response)
        }
      } catch (error) {
        console.error('🔴 Failed to fetch stats:', error)
        // Set default values on error
        setStats({ members: 50, events: 10, blogs: 5 })
      }
    }

    fetchStats()
  }, [])

  useEffect(() => {
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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Animate counters on scroll into view
          const statsElements = countRef.current?.querySelectorAll("[data-count]")
          statsElements?.forEach((stat) => {
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
  }, [stats])

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
          <span className="text-xs sm:text-sm font-semibold text-primary">Join {stats.members}+ Members Today</span>
        </div>

        {/* CHANGE: Cinematic hero title with staggered reveal */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both"
          style={{ animationDelay: "100ms" }}
        >
          <span className="text-foreground">Your</span>{" "}
          <span className="text-primary">Hub</span>{" "}
          <span className="text-accent">For</span>{" "}
          <span className="text-foreground">Everything</span>{" "}
          <span className="text-primary">BIT</span>{" "}
          <span className="text-foreground">at</span>{" "}
          <span className="text-accent">UEAB</span>
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
              <span data-count={stats.members}>0</span>+
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-2">Active Members</div>
          </div>
          <div className="glass p-4 sm:p-6 rounded-xl group hover:shadow-lg hover:shadow-secondary/20 transition-all duration-300">
            <div className="text-3xl sm:text-4xl font-bold text-secondary">
              <span data-count={stats.events}>0</span>+
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-2">Total Events</div>
          </div>
          <div className="glass p-4 sm:p-6 rounded-xl group hover:shadow-lg hover:shadow-accent/20 transition-all duration-300">
            <div className="text-3xl sm:text-4xl font-bold text-accent">
              <span data-count={stats.blogs}>0</span>+
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-2">Blog Posts</div>
          </div>
        </div>
      </div>
    </section>
  )
}
