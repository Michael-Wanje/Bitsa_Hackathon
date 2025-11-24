"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, MapPin, Clock, ArrowLeft, Users, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  endTime?: string
  location: string
  imageUrl?: string
  category?: string
  attendees: number
  isPast: boolean
}

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.id as string
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [registering, setRegistering] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        const response = await api.events.getById(eventId)
        const eventData = response.data?.event || response.event || response
        if (eventData && eventData.id) {
          setEvent({
            id: eventData.id,
            title: eventData.title,
            description: eventData.description || "",
            date: new Date(eventData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            time: eventData.time,
            endTime: eventData.endTime,
            location: eventData.location,
            imageUrl: eventData.imageUrl,
            category: eventData.category,
            attendees: eventData.registrations?.length || 0,
            isPast: new Date(eventData.date) < new Date(),
          })
        } else {
          setError("Event not found")
        }
      } catch (err) {
        console.error("[v0] Event detail fetch error:", err)
        setError("Failed to load event")
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  const handleRegister = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register for events",
        variant: "destructive",
      })
      window.location.href = "/login?redirect=/events/" + eventId
      return
    }

    setRegistering(true)
    try {
      const response = await api.events.register(eventId)
      if (response.success) {
        toast({
          title: "Success!",
          description: "You have successfully registered for this event",
        })
        // Update attendee count
        setEvent(prev => prev ? { ...prev, attendees: prev.attendees + 1 } : null)
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
      setRegistering(false)
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
        <Toaster />
      </>
    )
  }

  if (error || !event) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">{error || "Event not found"}</h1>
            <Link href="/events">
              <Button>Back to events</Button>
            </Link>
          </div>
        </div>
        <Footer />
        <Toaster />
      </>
    )
  }

  return (
    <>
      <Navigation />

      <main className="min-h-screen">
        {/* Header */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border bg-linear-to-b from-secondary/5 to-transparent">
          <div className="max-w-4xl mx-auto">
            <Link href="/events" className="inline-flex items-center text-secondary hover:text-secondary/80 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to events
            </Link>

            {event.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary mb-4">
                {event.category}
              </span>
            )}

            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">{event.title}</h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-secondary" />
                {event.date}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-secondary" />
                {event.time}{event.endTime && ` - ${event.endTime}`}
              </span>
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-secondary" />
                {event.location}
              </span>
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-secondary" />
                {event.attendees} attending
              </span>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        {event.imageUrl && (
          <section className="px-4 sm:px-6 lg:px-8 -mt-6 mb-6">
            <div className="max-w-5xl mx-auto">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-64 sm:h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          </section>
        )}

        {/* Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold text-foreground mb-4">About This Event</h2>
                <div className="prose prose-sm sm:prose max-w-none text-foreground/80 leading-relaxed">
                  {event.description.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="md:col-span-1">
                <Card className="p-6 sticky top-24">
                  <h3 className="text-lg font-bold text-foreground mb-4">Event Details</h3>
                  <div className="space-y-4 text-sm mb-6">
                    <div>
                      <p className="text-muted-foreground mb-1">Date</p>
                      <p className="font-medium">{event.date}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Time</p>
                      <p className="font-medium">{event.time}{event.endTime && ` - ${event.endTime}`}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Location</p>
                      <p className="font-medium">{event.location}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Attendees</p>
                      <p className="font-medium">{event.attendees} registered</p>
                    </div>
                  </div>

                  {!event.isPast && (
                    <Button
                      className="w-full bg-secondary hover:bg-secondary/90"
                      onClick={handleRegister}
                      disabled={registering}
                    >
                      {registering ? (
                        <>
                          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        "Register for Event"
                      )}
                    </Button>
                  )}

                  {event.isPast && (
                    <div className="text-center py-4 px-3 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">This event has ended</p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <Toaster />
    </>
  )
}
