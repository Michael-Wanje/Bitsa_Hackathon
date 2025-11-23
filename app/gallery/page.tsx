"use client"

import { useState, useEffect, useMemo } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { X, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

interface GalleryPhoto {
  id: string
  imageUrl: string
  caption: string
  eventId?: string
  uploadedAt: string
  event?: {
    id: string
    title: string
  }
}

export default function GalleryPage() {
  const [selectedEvent, setSelectedEvent] = useState("All")
  const [selectedYear, setSelectedYear] = useState("All")
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null)
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [events, setEvents] = useState<string[]>([])
  const [years, setYears] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true)
        const response = await api.gallery.getAll({ limit: 100 })
        
        if (response.success && response.data?.photos) {
          const photosArray = response.data.photos
          setPhotos(photosArray)

          // Extract unique events
          const uniqueEvents: string[] = ["All"]
          const eventsSet = new Set<string>()
          photosArray.forEach((p: GalleryPhoto) => {
            if (p.event?.title) {
              eventsSet.add(p.event.title)
            }
          })
          uniqueEvents.push(...Array.from(eventsSet))
          setEvents(uniqueEvents)

          // Extract unique years from uploadedAt
          const yearsSet = new Set<number>()
          photosArray.forEach((p: GalleryPhoto) => {
            const year = new Date(p.uploadedAt).getFullYear()
            yearsSet.add(year)
          })
          const uniqueYears = Array.from(yearsSet).sort((a, b) => b - a)
          setYears(uniqueYears)
        }
      } catch (err) {
        console.error("[v0] Gallery fetch error:", err)
        setError("Failed to load gallery photos")
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [selectedEvent, selectedYear])

  const filteredPhotos = useMemo(() => {
    return (photos || []).filter((photo) => {
      const photoYear = new Date(photo.uploadedAt).getFullYear()
      const matchesEvent = selectedEvent === "All" || photo.event?.title === selectedEvent
      const matchesYear = selectedYear === "All" || photoYear.toString() === selectedYear
      return matchesEvent && matchesYear
    })
  }, [photos, selectedEvent, selectedYear])

  return (
    <>
      <Navigation />

      <main className="min-h-screen">
        {/* Header */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-accent/5 to-transparent border-b border-border">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Photo Gallery</h1>
            <p className="text-lg text-muted-foreground">Moments from our events and community activities</p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-background border-b border-border sticky top-16 z-40">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Event Filter */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Filter by Event</h3>
              <div className="flex flex-wrap gap-2">
                {events.map((event) => (
                  <button
                    key={event}
                    onClick={() => setSelectedEvent(event)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedEvent === event
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {event}
                  </button>
                ))}
              </div>
            </div>

            {/* Year Filter */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Filter by Year</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedYear("All")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedYear === "All"
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  All Years
                </button>
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year.toString())}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedYear === year.toString()
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-destructive">{error}</p>
              </div>
            ) : filteredPhotos.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-foreground mb-2">No photos found</h3>
                <p className="text-muted-foreground">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPhotos.map((photo) => (
                  <div key={photo.id} onClick={() => setSelectedPhoto(photo)} className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-lg aspect-square bg-muted hover:shadow-lg transition-all">
                      <img
                        src={photo.imageUrl || "/placeholder.svg"}
                        alt={photo.caption || "Gallery photo"}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end">
                        <div className="p-4">
                          {photo.caption && (
                            <p className="font-bold text-sm sm:text-base line-clamp-2 mb-1 text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.9)' }}>{photo.caption}</p>
                          )}
                          {photo.event && (
                            <p className="text-xs font-medium line-clamp-1 text-cyan-300" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.9)' }}>{photo.event.title}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 text-white hover:text-white/70 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            <img
              src={selectedPhoto.imageUrl || "/placeholder.svg"}
              alt={selectedPhoto.caption || "Gallery photo"}
              className="w-full h-auto rounded-lg"
            />

            <div className="mt-4 text-white space-y-3">
              {selectedPhoto.caption && (
                <div>
                  <h3 className="text-2xl font-bold mb-1">{selectedPhoto.caption}</h3>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/70 pt-3 border-t border-white/20">
                {selectedPhoto.event && (
                  <span className="inline-block px-3 py-1 rounded-full bg-white/10">{selectedPhoto.event.title}</span>
                )}
                <span className="ml-auto">{new Date(selectedPhoto.uploadedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
