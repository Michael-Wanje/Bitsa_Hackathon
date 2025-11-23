"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarDays, ArrowRight, Users, Clock } from "lucide-react"
import { getEvents } from "@/lib/api"

interface Event {
  id: string
  title: string
  date: string
  attendeeCount: number
  status: string
}

export default function EventPreview() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getEvents("upcoming", undefined, 1, 3)
        if (response.success) {
          setEvents(response.data.events)
        } else {
          setError("Failed to load events")
        }
      } catch (err) {
        console.error(err)
        setError("Error loading events")
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  if (loading) {
    return (
      <div className="rounded-2xl p-8 backdrop-blur-md bg-white/10 border border-white/20 animate-pulse">
        <div className="h-20 bg-muted rounded-lg mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-8 backdrop-blur-md bg-white/10 border border-white/20 group card-hover-lift">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
          <CalendarDays className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-primary">Upcoming Events</h3>
          <p className="text-sm text-muted-foreground mt-1">{events.length} events coming soon</p>
        </div>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="group/item p-4 rounded-lg hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-primary/20 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-semibold text-foreground group-hover/item:text-primary transition-colors duration-300">
                  {event.title}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {event.attendeeCount}
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold`}>{event.status}</div>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-destructive text-sm mt-4">{error}</p>}

      <Link href="/events" className="mt-6 block">
        <Button className="btn-primary w-full justify-between group/btn">
          View All Events
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </Link>
    </div>
  )
}
