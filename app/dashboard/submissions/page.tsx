"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Loader2, Clock, CheckCircle, XCircle, Edit, Trash2, Plus } from "lucide-react"
import { api } from "@/lib/api"

interface BlogSubmission {
  id: string
  title: string
  excerpt: string
  category: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
}

interface EventSubmission {
  id: string
  title: string
  description: string
  date: string
  location: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PENDING":
      return (
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-sm font-medium">
          <Clock className="w-3 h-3" />
          Pending
        </div>
      )
    case "APPROVED":
      return (
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-medium">
          <CheckCircle className="w-3 h-3" />
          Approved
        </div>
      )
    case "REJECTED":
      return (
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-sm font-medium">
          <XCircle className="w-3 h-3" />
          Rejected
        </div>
      )
    default:
      return null
  }
}

export default function MySubmissionsPage() {
  const router = useRouter()
  const [blogs, setBlogs] = useState<BlogSubmission[]>([])
  const [events, setEvents] = useState<EventSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchMySubmissions = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/auth/login")
          return
        }

        const [blogsRes, eventsRes] = await Promise.all([
          api.blog.getMyBlogs(),
          api.events.getMyEvents(),
        ])

        if (blogsRes.success) {
          setBlogs(blogsRes.data?.blogs || [])
        }
        if (eventsRes.success) {
          setEvents(eventsRes.data?.events || [])
        }
      } catch (error) {
        console.error("Failed to fetch submissions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMySubmissions()
  }, [])

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return

    setDeleting((prev) => new Set(prev).add(id))
    try {
      const response = await api.blog.delete(id)
      if (response.success) {
        setBlogs((prev) => prev.filter((b) => b.id !== id))
        alert("Blog deleted successfully")
      } else {
        alert("Failed to delete blog")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Error deleting blog")
    } finally {
      setDeleting((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return

    setDeleting((prev) => new Set(prev).add(id))
    try {
      const response = await api.events.delete(id)
      if (response.success) {
        setEvents((prev) => prev.filter((e) => e.id !== id))
        alert("Event deleted successfully")
      } else {
        alert("Failed to delete event")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Error deleting event")
    } finally {
      setDeleting((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
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

  return (
    <>
      <Navigation />

      <main className="min-h-screen pb-12 bg-linear-to-b from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
        {/* Header */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-primary via-blue-600 to-primary dark:from-primary/80 dark:via-blue-700 dark:to-primary/80 border-b border-primary/20 shadow-lg">
          <div className="max-w-6xl mx-auto">
            <Link href="/dashboard" className="inline-flex items-center text-white hover:text-white/80 mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to dashboard
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-bold text-white mb-2">My Submissions</h1>
                <p className="text-white/80">View and manage your blog posts and events</p>
              </div>
              <div className="flex gap-3">
                <Button asChild className="bg-white text-primary hover:bg-white/90">
                  <Link href="/blog/create" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Blog
                  </Link>
                </Button>
                <Button asChild className="bg-white text-primary hover:bg-white/90">
                  <Link href="/events/create" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Event
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="blogs" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <TabsTrigger value="blogs" className="gap-2">
                  My Blogs ({blogs.length})
                </TabsTrigger>
                <TabsTrigger value="events" className="gap-2">
                  My Events ({events.length})
                </TabsTrigger>
              </TabsList>

              {/* Blogs Tab */}
              <TabsContent value="blogs" className="mt-8 space-y-6">
                {blogs.length === 0 ? (
                  <Card className="p-12 text-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <p className="text-lg font-semibold text-foreground mb-2">No blogs yet</p>
                    <p className="text-muted-foreground mb-6">Start sharing your thoughts with the community!</p>
                    <Button className="bg-primary hover:bg-primary/90" asChild>
                      <Link href="/blog/create">Create Blog Post</Link>
                    </Button>
                  </Card>
                ) : (
                  blogs.map((blog) => (
                    <Card key={blog.id} className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-foreground truncate">{blog.title}</h3>
                            <StatusBadge status={blog.status} />
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{blog.excerpt}</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div>
                              <span className="font-medium text-foreground">Category: </span>
                              <span className="text-muted-foreground">{blog.category}</span>
                            </div>
                            <div>
                              <span className="font-medium text-foreground">Submitted: </span>
                              <span className="text-muted-foreground">{new Date(blog.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {blog.status === "PENDING" && (
                            <Button size="sm" variant="outline" className="gap-2" asChild>
                              <Link href={`/blog/edit/${blog.id}`}>
                                <Edit className="w-4 h-4" />
                                Edit
                              </Link>
                            </Button>
                          )}
                          {blog.status !== "APPROVED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 gap-2"
                              onClick={() => handleDeleteBlog(blog.id)}
                              disabled={deleting.has(blog.id)}
                            >
                              {deleting.has(blog.id) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Events Tab */}
              <TabsContent value="events" className="mt-8 space-y-6">
                {events.length === 0 ? (
                  <Card className="p-12 text-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <p className="text-lg font-semibold text-foreground mb-2">No events yet</p>
                    <p className="text-muted-foreground mb-6">Organize your first event and bring people together!</p>
                    <Button className="bg-primary hover:bg-primary/90" asChild>
                      <Link href="/events/create">Create Event</Link>
                    </Button>
                  </Card>
                ) : (
                  events.map((event) => (
                    <Card key={event.id} className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-foreground truncate">{event.title}</h3>
                            <StatusBadge status={event.status} />
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{event.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div>
                              <span className="font-medium text-foreground">Date: </span>
                              <span className="text-muted-foreground">{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div>
                              <span className="font-medium text-foreground">Location: </span>
                              <span className="text-muted-foreground">{event.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {event.status === "PENDING" && (
                            <Button size="sm" variant="outline" className="gap-2" asChild>
                              <Link href={`/events/edit/${event.id}`}>
                                <Edit className="w-4 h-4" />
                                Edit
                              </Link>
                            </Button>
                          )}
                          {event.status !== "APPROVED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 gap-2"
                              onClick={() => handleDeleteEvent(event.id)}
                              disabled={deleting.has(event.id)}
                            >
                              {deleting.has(event.id) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
