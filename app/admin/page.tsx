"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Users, BookOpen, Calendar, ImageIcon, TrendingUp, ArrowRight, Settings, Lock, Loader2, Clock } from "lucide-react"
import { api } from "@/lib/api"

interface AdminStats {
  label: string
  value: number
  icon: React.ReactNode
  trend?: string
}

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [stats, setStats] = useState<AdminStats[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingBlogs, setPendingBlogs] = useState(0)
  const [pendingEvents, setPendingEvents] = useState(0)

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        const userStr = localStorage.getItem("user")

        if (!token) {
          console.log("No token found")
          setIsAdmin(false)
          return
        }

        // Check if user has ADMIN role
        let userRole = null
        if (userStr) {
          try {
            const user = JSON.parse(userStr)
            userRole = user.role
            console.log("User role from localStorage:", userRole)
          } catch (e) {
            console.error("Failed to parse user from localStorage:", e)
          }
        }

        // If no role in localStorage, verify via API
        if (!userRole) {
          const profileData = await api.user.getProfile()
          userRole = profileData.data?.user?.role || profileData.data?.role
          console.log("User role from API:", userRole)
        }

        if (userRole !== "ADMIN") {
          console.log("User is not an admin. Role:", userRole)
          setIsAdmin(false)
          return
        }

        const dashboardData = await api.admin.getDashboard()

        setIsAdmin(true)
        
        // Extract stats from the nested structure
        const stats = dashboardData.data?.stats || dashboardData.stats || {}
        
        setStats([
          {
            label: "Total Users",
            value: stats.totalUsers || 0,
            icon: <Users className="w-6 h-6" />,
            trend: "",
          },
          {
            label: "Blog Posts",
            value: stats.totalBlogs || 0,
            icon: <BookOpen className="w-6 h-6" />,
            trend: "",
          },
          {
            label: "Events",
            value: stats.totalEvents || 0,
            icon: <Calendar className="w-6 h-6" />,
            trend: "",
          },
          {
            label: "Gallery Photos",
            value: stats.totalPhotos || 0,
            icon: <ImageIcon className="w-6 h-6" />,
            trend: "",
          },
        ])

        // Fetch pending items
        const [pendingBlogsRes, pendingEventsRes] = await Promise.all([
          api.blog.getPendingBlogs({ limit: 1 }),
          api.events.getPendingEvents({ limit: 1 }),
        ])

        setPendingBlogs(pendingBlogsRes.data?.pagination?.total || 0)
        setPendingEvents(pendingEventsRes.data?.pagination?.total || 0)
      } catch (err) {
        console.error("[v0] Admin fetch error:", err)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  const adminTools = [
    {
      title: "Manage Users",
      description: "View, edit, and delete user accounts",
      icon: Users,
      href: "/admin/users",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Manage Blog Posts",
      description: "Create, edit, and delete blog posts",
      icon: BookOpen,
      href: "/admin/blog",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Manage Events",
      description: "Create, edit, and delete events",
      icon: Calendar,
      href: "/admin/events",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Manage Gallery",
      description: "Upload and manage gallery photos",
      icon: ImageIcon,
      href: "/admin/gallery",
      color: "from-orange-500 to-orange-600",
    },
    {
      title: "Content Approvals",
      description: "Review and approve pending submissions",
      icon: Clock,
      href: "/admin/approvals",
      color: "from-amber-500 to-amber-600",
      badge: pendingBlogs + pendingEvents > 0 ? pendingBlogs + pendingEvents : undefined,
    },
  ]

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </>
    )
  }

  if (!isAdmin) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center px-4 bg-linear-to-br from-primary/5 to-background">
          <Card className="max-w-md w-full p-8 text-center border-destructive/30">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-8">
              You don't have permission to access the admin dashboard. Only administrators can access this area.
            </p>
            <Button className="w-full" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </Card>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navigation />

      <main className="min-h-screen pb-12">
        {/* Header */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-primary via-blue-600 to-primary dark:from-primary/80 dark:via-blue-700 dark:to-primary/80 border-b border-primary/20 shadow-xl">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-bold text-white mb-2">Admin Dashboard</h1>
                <p className="text-white/90 mt-2 text-lg">Manage BITSA content and members</p>
              </div>
              <Button asChild className="gap-2 bg-white text-primary hover:bg-white/90 shadow-lg">
                <Link href="/admin/settings">
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, index) => (
                <Card key={index} className="p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-linear-to-br from-white via-white to-primary/5 dark:from-slate-900 dark:via-slate-900 dark:to-primary/10 border-primary/20">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 rounded-xl bg-linear-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg">
                      {stat.icon}
                    </div>
                    {stat.trend && (
                      <div className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                        <TrendingUp className="w-3 h-3" />
                        {stat.trend}
                      </div>
                    )}
                  </div>
                  <p className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-4">{stat.label}</p>
                  <p className="text-5xl font-bold bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent dark:text-white">{stat.value}</p>
                </Card>
              ))}
            </div>

            {/* Admin Tools */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-3">Management Tools</h2>
              <p className="text-muted-foreground text-lg">Quick access to essential admin functions</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminTools.map((tool) => {
                const Icon = tool.icon
                return (
                  <Link key={tool.href} href={tool.href} className="group">
                    <Card className="p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer h-full relative border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                      <div className="absolute inset-0 bg-linear-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {tool.badge && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg animate-pulse">
                          {tool.badge}
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-6 relative z-10">
                        <div
                          className={`w-16 h-16 rounded-xl bg-linear-to-br ${tool.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className="w-8 h-8" />
                        </div>
                        <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:translate-x-2 group-hover:text-primary transition-all duration-300" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-3 relative z-10 group-hover:text-primary transition-colors">{tool.title}</h3>
                      <p className="text-muted-foreground relative z-10 text-base">{tool.description}</p>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
