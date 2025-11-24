"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Images, ArrowRight } from "lucide-react"
import { api } from "@/lib/api"

interface Photo {
  id: string
  imageUrl: string
  caption?: string
  eventId?: string
  event?: {
    title: string
  }
}

export default function GalleryPreview() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await api.gallery.getAll({ limit: 6 })
        const photosList = response.data?.photos || response.photos || []
        setPhotos(photosList)
      } catch (error) {
        console.error('Failed to fetch gallery photos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [])

  return (
    <div className="rounded-2xl p-8 backdrop-blur-md bg-white/10 border border-white/20 group card-hover-lift">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center group-hover:shadow-lg group-hover:shadow-accent/30 transition-all duration-300">
          <Images className="w-7 h-7 text-accent-foreground" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-foreground">Photo Gallery</h3>
          <p className="text-sm text-muted-foreground mt-1">Latest memories</p>
        </div>
      </div>

      <div className="space-y-3 mb-6 border-t border-white/10 pt-6">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Loading photos...</div>
        ) : photos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">No photos yet. Check back soon!</div>
        ) : (
          photos.map((photo) => (
            <div
              key={photo.id}
              className="group/item p-4 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer border border-transparent hover:border-white/10"
            >
              <div className="flex items-start gap-3">
                <img
                  src={photo.imageUrl}
                  alt={photo.caption || 'Gallery photo'}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-foreground group-hover/item:text-accent transition-colors">
                    {photo.event?.title || photo.caption || 'Untitled'}
                  </p>
                  {photo.caption && (
                    <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2">{photo.caption}</p>
                  )}
                </div>
                <div className="text-2xl text-accent/20 group-hover/item:text-accent/40 transition-colors">→</div>
              </div>
            </div>
          ))
        )}
      </div>

      <Link href="/gallery" className="block">
        <Button className="btn-primary w-full justify-between group/btn">
          View Gallery
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </Link>
    </div>
  )
}
