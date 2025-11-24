"use client"

import { useState, useEffect, useMemo } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Calendar, MapPin, Users, ArrowRight, Clock, Filter, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface Event {
  id: number
  title: string
  description: string
  date: string
  time: string
  location: string
  attendeeCount?: number
  attendees?: number
  category: string
  isPast: boolean
  imageUrl?: string
}

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<string[]>(["All"])
  const [showPastEvents, setShowPastEvents] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [registering, setRegistering] = useState<Set<number>>(new Set())
  const { toast } = useToast()

  const handleRegister = async (eventId: number) => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register for events",
        variant: "destructive",
      })
      // Redirect to login
      window.location.href = "/login?redirect=/events"
      return
    }

    setRegistering((prev) => new Set(prev).add(eventId))
    try {
      const response = await api.events.register(eventId.toString())
      if (response.success) {
        toast({
          title: "Success!",
          description: "You have successfully registered for this event",
        })
        // Refresh events to update attendee count
        fetchEvents()
        // Dispatch event to update dashboard
        window.dispatchEvent(new Event("eventRegistered"))
      } else {
        toast({
          title: "Registration Failed",
          description: response.message || "Failed to register for event",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Error",
        description: "Failed to register for event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRegistering((prev) => {
        const newSet = new Set(prev)
        newSet.delete(eventId)
        return newSet
      })
    }
  }

  const fetchEvents = async () => {
      try {
        setLoading(true)
        const data = await api.events.getAll({
          search: searchQuery,
          category: selectedCategory === "All" ? undefined : selectedCategory,
          isPast: showPastEvents,
        })
        // Map backend events to always have attendeeCount
        const eventsListRaw = data.data?.events || data.events || [];
        const eventsList: Event[] = eventsListRaw.map((e: any) => ({
          ...e,
          attendeeCount: typeof e.attendeeCount === 'number' ? e.attendeeCount : (typeof e.attendees === 'number' ? e.attendees : 0)
        }));
        setEvents(eventsList)

        const uniqueCategories = ["All", ...new Set(eventsList.map((e: Event) => e.category).filter(Boolean))]
        setCategories(uniqueCategories)
      } catch (err) {
        console.error("[v0] Events fetch error:", err)
        setError("Failed to load events")
      } finally {
        setLoading(false)
      }
  }

  useEffect(() => {
    fetchEvents()
  }, [searchQuery, selectedCategory, showPastEvents])

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || event.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [events, searchQuery, selectedCategory])

  return (
    <>
      <Navigation />

      <main className="min-h-screen">
        {/* Header */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-secondary/5 to-transparent border-b border-border">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Events</h1>
            <p className="text-lg text-muted-foreground">
              Join us for workshops, seminars, networking events, and hackathons
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-background border-b border-border overflow-x-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Search */}
            <div className="relative">
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4"
              />
            </div>

            {/* Category Filter and Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowPastEvents(!showPastEvents)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  showPastEvents ? "bg-muted text-foreground" : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                <Filter className="w-4 h-4" />
                {showPastEvents ? "Showing Past" : "Upcoming"}
              </button>
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-destructive">{error}</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-foreground mb-2">No events found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow group h-full flex flex-col"
                  >
                    {/* Event Image */}
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-linear-to-br from-secondary/20 via-secondary/10 to-accent/20 flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-secondary/40" />
                      </div>
                    )}
                    
                    <div className="p-6 flex flex-col flex-1">
                      <div className="mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                          {event.category}
                        </span>
                        {event.isPast && (
                          <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                            Past Event
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-secondary transition-colors line-clamp-2">
                        {event.title}
                      </h3>

                      <p className="text-sm text-foreground/70 mb-6 flex-1">{event.description}</p>

                      {/* Event Details */}
                      <div className="space-y-3 mb-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-secondary" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-secondary" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-secondary" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-secondary" />
                          <span>{typeof event.attendeeCount === 'number' ? event.attendeeCount : 0}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => window.location.href = `/events/${event.id}`}
                        >
                          View Event
                        </Button>
                        {!event.isPast && (
                          <Button
                            className="bg-secondary hover:bg-secondary/90 flex-1"
                            onClick={() => handleRegister(event.id)}
                            disabled={registering.has(event.id)}
                          >
                            {registering.has(event.id) ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                              </>
                            ) : (
                              <>Register</>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <Toaster />
    </>
  )
}
