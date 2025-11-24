"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Calendar, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

interface Photo {
  id: string
  imageUrl: string
  caption?: string
  uploadedAt: string
  event?: {
    id: string
    title: string
  }
}

export default function GalleryPhotoPage({ params }: { params: { id: string } }) {
  const [photo, setPhoto] = useState<Photo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const response = await api.gallery.getById(params.id)
        if (response.success && response.data?.photo) {
          setPhoto(response.data.photo)
        } else {
          setError("Photo not found")
        }
      } catch (err) {
        setError("Failed to load photo")
      } finally {
        setLoading(false)
      }
    }

    fetchPhoto()
  }, [params.id])

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

  if (error || !photo) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center px-4">
          <Card className="max-w-md w-full p-8 text-center">
            <p className="text-destructive mb-6">{error || "Photo not found"}</p>
            <Button onClick={() => router.push("/gallery")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Gallery
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
      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="outline" 
            className="mb-6"
            onClick={() => router.push("/gallery")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Gallery
          </Button>

          <Card className="overflow-hidden">
            <img
              src={photo.imageUrl}
              alt={photo.caption || "Gallery photo"}
              className="w-full h-auto max-h-[70vh] object-contain"
            />
            <div className="p-6">
              {photo.caption && (
                <h1 className="text-2xl font-bold text-foreground mb-4">{photo.caption}</h1>
              )}
              
              <div className="space-y-2 text-sm text-muted-foreground">
                {photo.event && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Event: {photo.event.title}</span>
                  </div>
                )}
                <div>
                  Uploaded: {new Date(photo.uploadedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}