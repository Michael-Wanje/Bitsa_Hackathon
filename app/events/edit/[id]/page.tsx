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

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    endTime: "",
    location: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [canEdit, setCanEdit] = useState(true)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.events.getById(eventId)
        const event = response.data?.event || response.event || response
        
        if (!event) {
          alert("Event not found")
          router.push("/dashboard/submissions")
          return
        }

        // Check if event is approved
        if (event.status === "APPROVED") {
          alert("You cannot edit an approved event")
          setCanEdit(false)
          router.push("/dashboard/submissions")
          return
        }

        // Format date for input field
        const dateObj = new Date(event.date)
        const formattedDate = dateObj.toISOString().split('T')[0]

        setFormData({
          title: event.title || "",
          description: event.description || "",
          date: formattedDate,
          time: event.time || "",
          endTime: event.endTime || "",
          location: event.location || "",
        })
      } catch (error) {
        console.error("Failed to fetch event:", error)
        alert("Failed to load event")
        router.push("/dashboard/submissions")
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
    if (!formData.time) newErrors.time = "Time is required"
    if (!formData.location.trim()) newErrors.location = "Location is required"

    // Validate time format
    if (formData.time && !/^\d{2}:\d{2}$/.test(formData.time)) {
      newErrors.time = "Time must be in HH:MM format"
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canEdit) return

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSubmitting(true)
    try {
      const response = await api.events.update(eventId, {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        endTime: formData.endTime || undefined,
        location: formData.location,
      })

      if (response.success) {
        alert("Event updated successfully!")
        router.push("/dashboard/submissions")
      } else {
        alert(response.message || "Failed to update event")
      }
    } catch (error) {
      console.error("Update event error:", error)
      alert("Error updating event. Please try again.")
    } finally {
      setSubmitting(false)
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
          <div className="max-w-4xl mx-auto">
            <Link href="/dashboard/submissions" className="inline-flex items-center text-white hover:text-white/80 mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to submissions
            </Link>
            <h1 className="text-5xl font-bold text-white mb-2">Edit Event</h1>
            <p className="text-white/80">Update your event before approval</p>
          </div>
        </section>

        {/* Form */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 shadow-xl border-2 border-primary/10 hover:border-primary/20 transition-colors">
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
                    className={`text-lg ${errors.title ? "border-destructive" : ""}`}
                  />
                  {errors.title && <p className="text-destructive text-sm mt-1">{errors.title}</p>}
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
                    placeholder="Describe your event..."
                    rows={8}
                    className={`w-full px-4 py-2 border rounded-md bg-background text-foreground ${
                      errors.description ? "border-destructive" : "border-input"
                    }`}
                  />
                  {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
                </div>

                {/* Date */}
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

                {/* Start Time */}
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-foreground mb-2">
                    Start Time (HH:MM) *
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

                {/* End Time */}
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-foreground mb-2">
                    End Time (HH:MM) - Optional
                  </label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Leave blank if not applicable</p>
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
                    placeholder="Where will this event take place?"
                    className={errors.location ? "border-destructive" : ""}
                  />
                  {errors.location && <p className="text-destructive text-sm mt-1">{errors.location}</p>}
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={submitting || !canEdit}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Event"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/submissions")}
                    disabled={submitting}
                    className="px-8 py-6 text-lg"
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
