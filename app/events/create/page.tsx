"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

export default function CreateEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    endTime: "",
    location: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

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
    if (!formData.description.trim())
      newErrors.description = "Description is required"
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
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const response = await api.events.create({
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        endTime: formData.endTime || undefined,
        location: formData.location,
        category: "Community",
      })

      if (response.success) {
        alert("Event submitted successfully! It's now pending approval.")
        router.push("/dashboard/submissions")
      } else {
        alert(response.message || "Failed to create event")
      }
    } catch (error) {
      console.error("Create event error:", error)
      alert("Error creating event. Please try again.")
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-5xl font-bold text-white mb-2">Create Event</h1>
            <p className="text-white/80">Organize and share your event with the community</p>
          </div>
        </section>

        {/* Form */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Event Title *
                  </label>
                  <Input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter event title"
                    className={`border-2 transition-colors ${
                      errors.title
                        ? "border-destructive bg-destructive/5"
                        : "border-slate-200 dark:border-slate-700 focus:border-primary"
                    }`}
                  />
                  {errors.title && (
                    <p className="text-xs text-destructive mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your event"
                    rows={4}
                    className={`w-full px-4 py-2 border-2 rounded-lg transition-colors bg-white dark:bg-slate-900 text-foreground ${
                      errors.description
                        ? "border-destructive bg-destructive/5"
                        : "border-slate-200 dark:border-slate-700 focus:border-primary"
                    }`}
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive mt-1">{errors.description}</p>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Date *
                  </label>
                  <Input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`border-2 transition-colors ${
                      errors.date
                        ? "border-destructive bg-destructive/5"
                        : "border-slate-200 dark:border-slate-700 focus:border-primary"
                    }`}
                  />
                  {errors.date && (
                    <p className="text-xs text-destructive mt-1">{errors.date}</p>
                  )}
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Start Time (HH:MM) *
                  </label>
                  <Input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className={`border-2 transition-colors ${
                      errors.time
                        ? "border-destructive bg-destructive/5"
                        : "border-slate-200 dark:border-slate-700 focus:border-primary"
                    }`}
                  />
                  {errors.time && (
                    <p className="text-xs text-destructive mt-1">{errors.time}</p>
                  )}
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    End Time (HH:MM) - Optional
                  </label>
                  <Input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className={`border-2 transition-colors border-slate-200 dark:border-slate-700 focus:border-primary`}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Leave blank if not applicable</p>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Location *
                  </label>
                  <Input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Where will this event take place?"
                    className={`border-2 transition-colors ${
                      errors.location
                        ? "border-destructive bg-destructive/5"
                        : "border-slate-200 dark:border-slate-700 focus:border-primary"
                    }`}
                  />
                  {errors.location && (
                    <p className="text-xs text-destructive mt-1">{errors.location}</p>
                  )}
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Event"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-900 dark:text-blue-300">
                  📅 Your event will be submitted for approval. Once approved by admins, it will be visible to the community.
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
