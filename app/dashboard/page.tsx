"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, BookOpen, Users, LogOut, User, Mail, GraduationCap, ArrowRight, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

interface UserData {
  id: string
  fullName: string
  email: string
  role: string
}

interface RegisteredEvent {
  id: number
  title: string
  date: string
  time: string
  status: "registered" | "attended" | "completed"
  attendees: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredEvent[]>([])
  const [blogsRead, setBlogsRead] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Prevent multiple redirects
      if (redirecting) return
      
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        console.log("📊 Dashboard: Token from localStorage:", token ? "EXISTS" : "MISSING")

        if (!token) {
          console.log("📊 Dashboard: No token found, redirecting to login...")
          setRedirecting(true)
          window.location.href = "/auth/login"
          return
        }

        console.log("📊 Dashboard: Fetching user profile...")
        const userData = await api.user.getProfile()
        console.log("📊 Dashboard: User data:", userData)
        
        if (!userData.success || !userData.data) {
          console.log("📊 Dashboard: Invalid response, clearing token and redirecting...")
          setRedirecting(true)
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          window.location.href = "/auth/login"
          return
        }
        
        console.log("📊 Dashboard: User data.data:", userData.data)
        console.log("📊 Dashboard: User data.data.user:", userData.data?.user)
        setUser(userData.data?.user || userData.data)

        console.log("📊 Dashboard: Fetching user registrations...")
        const eventsData = await api.events.getUserRegistrations()
        console.log("📊 Dashboard: Events registration data:", eventsData)
        
        // Try different possible data structures
        const registrations = eventsData.data?.registrations || eventsData.data || eventsData.registrations || []
        console.log("📊 Dashboard: Resolved registrations:", registrations)
        // Map backend registration objects to RegisteredEvent type
        const mappedEvents = registrations.map((r: any) => {
          const e = r.event || r // fallback if event is top-level
          return {
            id: e.id,
            title: e.title || "",
            date: e.date || "",
            time: e.time || "",
            status: r.status || "registered",
            attendees: e.attendeeCount || 0
          }
        })
        setRegisteredEvents(mappedEvents)

        // Get blogs read count from localStorage
        const readBlogs = JSON.parse(localStorage.getItem("blogsRead") || "[]")
        setBlogsRead(readBlogs.length)
      } catch (err: any) {
        console.error("📊 Dashboard fetch error:", err)
        
        // If it's an authentication error, clear token and redirect
        if (err?.message?.includes("401") || err?.message?.includes("Unauthorized") || err?.message?.includes("authenticated")) {
          console.log("📊 Dashboard: Authentication error, clearing token and redirecting...")
          setRedirecting(true)
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          window.location.href = "/auth/login"
          return
        }
        
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()

    // Listen for storage changes to update blogs read in real-time
    const handleStorageChange = () => {
      const readBlogs = JSON.parse(localStorage.getItem("blogsRead") || "[]")
      setBlogsRead(readBlogs.length)
    }

    // Listen for event registration to refresh data
    const handleEventRegistration = () => {
      // Don't refetch if redirecting to avoid loops
      if (!redirecting) {
        fetchDashboardData()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("blogsReadUpdated", handleStorageChange)
    window.addEventListener("eventRegistered", handleEventRegistration)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("blogsReadUpdated", handleStorageChange)
      window.removeEventListener("eventRegistered", handleEventRegistration)
    }
  }, [redirecting])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/auth/login"
  }

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

  if (error || !user) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center px-4">
          <Card className="max-w-md w-full p-8 text-center">
            <p className="text-destructive mb-6">{error || "Please log in to view your dashboard"}</p>
            <Button className="w-full" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
          </Card>
        </div>
        <Footer />
      </>
    )
  }

  const stats = [
    { label: "Events Registered", value: registeredEvents.length.toString(), icon: Calendar },
    { label: "Blogs Read", value: blogsRead.toString(), icon: BookOpen },
    { label: "Community Member", value: "Active", icon: Users },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "registered":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "attended":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "completed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <Navigation />

      <main className="min-h-screen pb-12">
        {/* Header */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-primary/10 to-transparent border-b border-border">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
              <Button variant="outline" className="gap-2 bg-transparent" asChild>
                <Link href="/profile">
                  <User className="w-4 h-4" />
                  View Profile
                </Link>
              </Button>
            </div>
            <p className="text-lg text-muted-foreground">Welcome back, {user.fullName}!</p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.label} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Quick Actions - Enhanced Tiles */}
            <div className="mt-12 mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {/* View Submissions */}
                <Link href="/dashboard/submissions">
                  <Card className="group p-6 bg-linear-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                    <div className="flex flex-col h-full">
                      <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-300">
                        <BookOpen className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        My Submissions
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 grow">
                        View and manage your blog posts and events
                      </p>
                      <div className="flex items-center text-primary text-sm font-medium group-hover:translate-x-2 transition-transform">
                        View all
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </Card>
                </Link>

                {/* Create Blog */}
                <Link href="/blog/create">
                  <Card className="group p-6 bg-linear-to-br from-blue-500/10 via-blue-500/5 to-transparent border-2 border-blue-500/20 hover:border-blue-500/40 hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                    <div className="flex flex-col h-full">
                      <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-500/30 group-hover:scale-110 transition-all duration-300">
                        <BookOpen className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Create Blog Post
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 grow">
                        Share your knowledge and insights with the community
                      </p>
                      <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:translate-x-2 transition-transform">
                        Start writing
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </Card>
                </Link>

                {/* Create Event */}
                <Link href="/events/create">
                  <Card className="group p-6 bg-linear-to-br from-purple-500/10 via-purple-500/5 to-transparent border-2 border-purple-500/20 hover:border-purple-500/40 hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                    <div className="flex flex-col h-full">
                      <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 group-hover:bg-purple-500/30 group-hover:scale-110 transition-all duration-300">
                        <Calendar className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Create Event
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 grow">
                        Organize and host events for the community
                      </p>
                      <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium group-hover:translate-x-2 transition-transform">
                        Plan event
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Registered Events */}
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Registered Events</h2>
                  {registeredEvents.length === 0 ? (
                    <p className="text-muted-foreground mb-6">No registered events yet</p>
                  ) : (
                    <div className="space-y-4 mb-6">
                      {registeredEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start justify-between p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors"
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {event.date} at {event.time}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{event.attendees} Attendees</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap mb-2 ${getStatusColor(event.status)}`}
                            >
                              {event.status === "registered" && "Registered"}
                              {event.status === "attended" && "Attended"}
                              {event.status === "completed" && "Completed"}
                            </span>
                            <Link href={`/events/${event.id}`} passHref>
                              <Button size="sm" variant="outline">View Event</Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button asChild className="w-full">
                    <Link href="/events">Browse More Events</Link>
                  </Button>
                </Card>

                {/* Quick Actions */}
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <Link href="/blog">
                      <div className="group flex flex-col items-center justify-center p-6 rounded-lg border-2 border-border hover:border-primary/40 bg-linear-to-br from-primary/5 to-transparent hover:from-primary/10 transition-all duration-300 cursor-pointer h-full">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all mb-3">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors text-center">Read Blog Posts</span>
                      </div>
                    </Link>

                    <Link href="/gallery">
                      <div className="group flex flex-col items-center justify-center p-6 rounded-lg border-2 border-border hover:border-purple-500/40 bg-linear-to-br from-purple-500/5 to-transparent hover:from-purple-500/10 transition-all duration-300 cursor-pointer h-full">
                        <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:scale-110 transition-all mb-3">
                          <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="font-medium text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-center">View Gallery</span>
                      </div>
                    </Link>

                    <Link href="/dashboard/submissions">
                      <div className="group flex flex-col items-center justify-center p-6 rounded-lg border-2 border-border hover:border-blue-500/40 bg-linear-to-br from-blue-500/5 to-transparent hover:from-blue-500/10 transition-all duration-300 cursor-pointer h-full">
                        <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:scale-110 transition-all mb-3">
                          <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-center">My Submissions</span>
                      </div>
                    </Link>

                    <Link href="/contact">
                      <div className="group flex flex-col items-center justify-center p-6 rounded-lg border-2 border-border hover:border-green-500/40 bg-linear-to-br from-green-500/5 to-transparent hover:from-green-500/10 transition-all duration-300 cursor-pointer h-full">
                        <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 group-hover:scale-110 transition-all mb-3">
                          <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="font-medium text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors text-center">Contact Us</span>
                      </div>
                    </Link>
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* User Info Card */}
                <Card className="p-6 bg-linear-to-br from-primary/10 via-primary/5 to-secondary/10 border-primary/30">
                  <h3 className="font-semibold text-foreground mb-6">Account Information</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Name</p>
                      <p className="font-medium text-foreground">{user.fullName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </p>
                      <p className="font-medium text-foreground break-all">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Role
                      </p>
                      <p className="font-medium text-foreground">{user.role}</p>
                    </div>
                  </div>

                  <Button asChild className="w-full mt-6 bg-primary hover:bg-primary/90">
                    <Link href="/profile">
                      <User className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                </Card>

                {/* Logout Card */}
                <Card className="p-6 border-border">
                  <h3 className="font-semibold text-foreground mb-4">Session</h3>
                  <p className="text-sm text-muted-foreground mb-6">Logged in as {user.email}</p>
                  <Button variant="destructive" className="w-full justify-center gap-2" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
