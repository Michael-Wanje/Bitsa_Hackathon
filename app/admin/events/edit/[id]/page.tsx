"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

export default function AdminEditEventPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = String(params.id)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    endTime: "",
    location: "",
    imageUrl: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        const response = await api.events.getById(eventId)
        if (response.success || response.data) {
          const event = response.data?.event || response.event || response
          setFormData({
            title: event.title || "",
            description: event.description || "",
            date: event.date ? new Date(event.date).toISOString().split('T')[0] : "",
            time: event.time || "",
            endTime: event.endTime || "",
            location: event.location || "",
            imageUrl: event.imageUrl || "",
          })
        } else {
          alert("Failed to load event")
          router.push("/admin/events")
        }
      } catch (error) {
        console.error("Fetch event error:", error)
        alert("Error loading event")
        router.push("/admin/events")
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId, router])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.date) newErrors.date = "Date is required"
    if (!formData.time.trim()) newErrors.time = "Time is required"
    if (!formData.location.trim()) newErrors.location = "Location is required"
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSaving(true)
    try {
      const response = await api.events.update(eventId, {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        endTime: formData.endTime || undefined,
        location: formData.location,
        imageUrl: formData.imageUrl || undefined,
      })

      if (response.success) {
        alert("Event updated successfully!")
        router.push("/admin/events")
      } else {
        alert(response.message || "Failed to update event")
      }
    } catch (error) {
      console.error("Update event error:", error)
      alert("Error updating event. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen pb-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navigation />

      <main className="min-h-screen pb-12 bg-background">
        {/* Header */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-primary/5 to-transparent border-b border-border">
          <div className="max-w-4xl mx-auto">
            <Link href="/admin/events" className="inline-flex items-center text-primary hover:text-primary/80 mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to events management
            </Link>
            <h1 className="text-4xl font-bold text-foreground mb-2">Edit Event</h1>
            <p className="text-muted-foreground">Update the event details</p>
          </div>
        </section>

        {/* Form */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                    Event Title *
                  </label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter event title..."
                    className={errors.title ? "border-destructive" : ""}
                  />
                  {errors.title && <p className="text-destructive text-sm mt-1">{errors.title}</p>}
                </div>

                {/* Date and Time */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">
                      Date *
                    </label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      className={errors.date ? "border-destructive" : ""}
                    />
                    {errors.date && <p className="text-destructive text-sm mt-1">{errors.date}</p>}
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-foreground mb-2">
                      Start Time *
                    </label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleChange}
                      className={errors.time ? "border-destructive" : ""}
                    />
                    {errors.time && <p className="text-destructive text-sm mt-1">{errors.time}</p>}
                  </div>
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-foreground mb-2">
                      End Time (optional)
                    </label>
                    <Input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                    Location *
                  </label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter event location..."
                    className={errors.location ? "border-destructive" : ""}
                  />
                  {errors.location && <p className="text-destructive text-sm mt-1">{errors.location}</p>}
                </div>

                {/* Image URL */}
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-foreground mb-2">
                    Image URL (optional)
                  </label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the event..."
                    rows={8}
                    className={`w-full px-4 py-2 border rounded-md bg-background text-foreground ${
                      errors.description ? "border-destructive" : "border-input"
                    }`}
                  />
                  {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Update Event"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/events")}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
