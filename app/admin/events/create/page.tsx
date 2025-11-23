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

export default function AdminCreateEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    endTime: "",
    location: "",
    category: "Community",
    imageUrl: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const categories = [
    "Community",
    "Workshop",
    "Conference",
    "Meetup",
    "Hackathon",
    "Webinar",
    "Social",
    "Other",
  ]

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
        category: formData.category,
        imageUrl: formData.imageUrl || undefined,
      })

      if (response.success) {
        alert("Event created successfully!")
        router.push("/admin/events")
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
            <Link href="/admin/events" className="inline-flex items-center text-white hover:text-white/80 mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to events management
            </Link>
            <h1 className="text-5xl font-bold text-white mb-2">Create Event</h1>
            <p className="text-white/80">Create an official event as admin</p>
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

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md bg-background text-foreground border-input"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date and Time */}
                <div className="grid md:grid-cols-2 gap-4">
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
                      Start Time (HH:MM) *
                    </label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleChange}
                      placeholder="14:00"
                      className={errors.time ? "border-destructive" : ""}
                    />
                    {errors.time && <p className="text-destructive text-sm mt-1">{errors.time}</p>}
                  </div>
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
                    placeholder="16:00"
                    className={errors.endTime ? "border-destructive" : ""}
                  />
                  {errors.endTime && <p className="text-destructive text-sm mt-1">{errors.endTime}</p>}
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
                    placeholder="Describe your event..."
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
                    disabled={loading}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Event"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/events")}
                    disabled={loading}
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
