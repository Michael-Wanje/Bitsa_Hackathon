"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Check, X, Loader2, Clock, CheckCircle, XCircle } from "lucide-react"
import { api } from "@/lib/api"

interface BlogItem {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  author: { id: string; fullName: string; email: string }
  createdAt: string
  status: "PENDING" | "APPROVED" | "REJECTED"
}

interface EventItem {
  id: string
  title: string
  description: string
  date: string
  location: string
  author: { id: string; fullName: string; email: string }
  createdAt: string
  status: "PENDING" | "APPROVED" | "REJECTED"
}

export default function ApprovalsPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState<Set<string>>(new Set())
  const [rejecting, setRejecting] = useState<Set<string>>(new Set())
  const [expandedBlogs, setExpandedBlogs] = useState<Set<string>>(new Set())
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchPendingItems = async () => {
      try {
        const [blogsRes, eventsRes] = await Promise.all([
          api.blog.getPendingBlogs(),
          api.events.getPendingEvents(),
        ])

        if (blogsRes.success) {
          setBlogs(blogsRes.data?.blogs || [])
        }
        if (eventsRes.success) {
          setEvents(eventsRes.data?.events || [])
        }
      } catch (error) {
        console.error("Failed to fetch pending items:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPendingItems()
  }, [])

  const handleApproveBlog = async (id: string) => {
    setApproving((prev) => new Set(prev).add(id))
    try {
      const response = await api.blog.approve(id)
      if (response.success) {
        setBlogs((prev) => prev.filter((b) => b.id !== id))
        alert("Blog approved successfully")
      } else {
        alert("Failed to approve blog")
      }
    } catch (error) {
      console.error("Approval error:", error)
      alert("Error approving blog")
    } finally {
      setApproving((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleRejectBlog = async (id: string) => {
    setRejecting((prev) => new Set(prev).add(id))
    try {
      const response = await api.blog.reject(id)
      if (response.success) {
        setBlogs((prev) => prev.filter((b) => b.id !== id))
        alert("Blog rejected successfully")
      } else {
        alert("Failed to reject blog")
      }
    } catch (error) {
      console.error("Rejection error:", error)
      alert("Error rejecting blog")
    } finally {
      setRejecting((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleApproveEvent = async (id: string) => {
    setApproving((prev) => new Set(prev).add(id))
    try {
      const response = await api.events.approve(id)
      if (response.success) {
        setEvents((prev) => prev.filter((e) => e.id !== id))
        alert("Event approved successfully")
      } else {
        alert("Failed to approve event")
      }
    } catch (error) {
      console.error("Approval error:", error)
      alert("Error approving event")
    } finally {
      setApproving((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleRejectEvent = async (id: string) => {
    setRejecting((prev) => new Set(prev).add(id))
    try {
      const response = await api.events.reject(id)
      if (response.success) {
        setEvents((prev) => prev.filter((e) => e.id !== id))
        alert("Event rejected successfully")
      } else {
        alert("Failed to reject event")
      }
    } catch (error) {
      console.error("Rejection error:", error)
      alert("Error rejecting event")
    } finally {
      setRejecting((prev) => {
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
            <Link href="/admin" className="inline-flex items-center text-white hover:text-white/80 mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to admin
            </Link>
            <h1 className="text-5xl font-bold text-white mb-2">Content Approvals</h1>
            <p className="text-white/80">Review and manage pending blog posts and events</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="blogs" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <TabsTrigger value="blogs" className="gap-2">
                  <Clock className="w-4 h-4" />
                  Pending Blogs ({blogs.length})
                </TabsTrigger>
                <TabsTrigger value="events" className="gap-2">
                  <Clock className="w-4 h-4" />
                  Pending Events ({events.length})
                </TabsTrigger>
              </TabsList>

              {/* Blogs Tab */}
              <TabsContent value="blogs" className="mt-8 space-y-6">
                {blogs.length === 0 ? (
                  <Card className="p-12 text-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p className="text-lg font-semibold text-foreground mb-2">All caught up!</p>
                    <p className="text-muted-foreground">No pending blog posts to review.</p>
                  </Card>
                ) : (
                  blogs.map((blog) => {
                    const isExpanded = expandedBlogs.has(blog.id)
                    return (
                      <Card key={blog.id} className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-shadow">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-foreground mb-2">{blog.title}</h3>
                              <div className="flex flex-wrap gap-3 text-sm mb-3">
                                <div>
                                  <span className="font-medium text-foreground">Author: </span>
                                  <span className="text-muted-foreground">{blog.author.fullName}</span>
                                </div>
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
                            <div className="flex flex-col gap-2 shrink-0">
                              <Button
                                onClick={() => handleApproveBlog(blog.id)}
                                disabled={approving.has(blog.id) || rejecting.has(blog.id)}
                                className="bg-green-600 hover:bg-green-700 text-white gap-2 whitespace-nowrap"
                              >
                                {approving.has(blog.id) ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Approving...
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-4 h-4" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={() => handleRejectBlog(blog.id)}
                                disabled={approving.has(blog.id) || rejecting.has(blog.id)}
                                variant="outline"
                                className="border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-700 dark:text-red-400 gap-2 whitespace-nowrap"
                              >
                                {rejecting.has(blog.id) ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Rejecting...
                                  </>
                                ) : (
                                  <>
                                    <X className="w-4 h-4" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Content Preview */}
                          <div className="border-t pt-4">
                            <h4 className="font-semibold text-foreground mb-2">Content:</h4>
                            <div className={`text-sm text-muted-foreground prose dark:prose-invert max-w-none ${!isExpanded ? 'line-clamp-3' : ''}`}>
                              {blog.content}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setExpandedBlogs(prev => {
                                  const newSet = new Set(prev)
                                  if (isExpanded) {
                                    newSet.delete(blog.id)
                                  } else {
                                    newSet.add(blog.id)
                                  }
                                  return newSet
                                })
                              }}
                              className="mt-2 text-primary hover:text-primary/80"
                            >
                              {isExpanded ? 'Show less' : 'Show full content'}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )
                  })
                )}
              </TabsContent>

              {/* Events Tab */}
              <TabsContent value="events" className="mt-8 space-y-6">
                {events.length === 0 ? (
                  <Card className="p-12 text-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p className="text-lg font-semibold text-foreground mb-2">All caught up!</p>
                    <p className="text-muted-foreground">No pending events to review.</p>
                  </Card>
                ) : (
                  events.map((event) => {
                    const isExpanded = expandedEvents.has(event.id)
                    return (
                      <Card key={event.id} className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-shadow">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-foreground mb-2">{event.title}</h3>
                              <div className="flex flex-wrap gap-3 text-sm mb-3">
                                <div>
                                  <span className="font-medium text-foreground">Author: </span>
                                  <span className="text-muted-foreground">{event.author.fullName}</span>
                                </div>
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
                            <div className="flex flex-col gap-2 shrink-0">
                              <Button
                                onClick={() => handleApproveEvent(event.id)}
                                disabled={approving.has(event.id) || rejecting.has(event.id)}
                                className="bg-green-600 hover:bg-green-700 text-white gap-2 whitespace-nowrap"
                              >
                                {approving.has(event.id) ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Approving...
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-4 h-4" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={() => handleRejectEvent(event.id)}
                                disabled={approving.has(event.id) || rejecting.has(event.id)}
                                variant="outline"
                                className="border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-700 dark:text-red-400 gap-2 whitespace-nowrap"
                              >
                                {rejecting.has(event.id) ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Rejecting...
                                  </>
                                ) : (
                                  <>
                                    <X className="w-4 h-4" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Description Preview */}
                          <div className="border-t pt-4">
                            <h4 className="font-semibold text-foreground mb-2">Description:</h4>
                            <div className={`text-sm text-muted-foreground whitespace-pre-wrap ${!isExpanded ? 'line-clamp-3' : ''}`}>
                              {event.description}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setExpandedEvents(prev => {
                                  const newSet = new Set(prev)
                                  if (isExpanded) {
                                    newSet.delete(event.id)
                                  } else {
                                    newSet.add(event.id)
                                  }
                                  return newSet
                                })
                              }}
                              className="mt-2 text-primary hover:text-primary/80"
                            >
                              {isExpanded ? 'Show less' : 'Show full description'}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )
                  })
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
