"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Plus, Edit, Trash2, Calendar, Users, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

interface Event {
  id: number
  title: string
  date: string
  attendees: number
  category: string
  status: "upcoming" | "past"
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await api.events.getAll({ limit: 50 })
        if (response.success) {
          // Extract events array from nested data structure and map to expected format
          const eventsArray = (response.data?.events || []).map((event: any) => ({
            id: event.id,
            title: event.title,
            date: event.date,
            attendees: event._count?.registrations || 0,
            category: event.status || "upcoming",
            status: new Date(event.date) > new Date() ? "upcoming" : "past",
          }))
          setEvents(eventsArray)
        } else {
          setError("Failed to load events")
        }
      } catch (err) {
        console.error("[v0] Fetch events error:", err)
        setError("Failed to load events")
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return (
    <>
      <Navigation />

      <main className="min-h-screen pb-12">
        {/* Header */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-primary/5 to-transparent border-b border-border">
          <div className="max-w-6xl mx-auto">
            <Link href="/admin" className="inline-flex items-center text-primary hover:text-primary/80 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to admin
            </Link>
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold text-foreground">Manage Events</h1>
              <Link href="/admin/events/create">
                <Button className="bg-primary hover:bg-primary/90 gap-2">
                  <Plus className="w-4 h-4" />
                  New Event
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            {error && <Card className="p-6 bg-destructive/10 border-destructive text-destructive">{error}</Card>}

            {!loading && !error && (
              <div className="grid gap-6">
                {events.map((event) => (
                  <Card key={event.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground mb-2">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {event.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.attendees} attendees
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {event.category}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              event.status === "upcoming"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                            }`}
                          >
                            {event.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!loading && !error && events.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No events found.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
