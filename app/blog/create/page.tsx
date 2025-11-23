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

export default function CreateBlogPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Technology",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const categories = [
    "Technology",
    "Tutorial",
    "News",
    "Announcement",
    "Guide",
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
    if (!formData.content.trim()) newErrors.content = "Content is required"
    if (!formData.category.trim()) newErrors.category = "Category is required"
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
      const response = await api.blog.create({
        title: formData.title,
        content: formData.content,
        category: formData.category,
      })

      if (response.success) {
        alert("Blog submitted successfully! It's now pending approval.")
        router.push("/dashboard/submissions")
      } else {
        alert(response.message || "Failed to create blog")
      }
    } catch (error) {
      console.error("Create blog error:", error)
      alert("Error creating blog. Please try again.")
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
            <h1 className="text-5xl font-bold text-white mb-2">Create Blog Post</h1>
            <p className="text-white/80">Share your knowledge and submit for community approval</p>
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
                    Title *
                  </label>
                  <Input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter blog post title"
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

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border-2 rounded-lg transition-colors bg-white dark:bg-slate-900 text-foreground ${
                      errors.category
                        ? "border-destructive bg-destructive/5"
                        : "border-slate-200 dark:border-slate-700 focus:border-primary"
                    }`}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-xs text-destructive mt-1">{errors.category}</p>
                  )}
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Content *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Write your blog post content here..."
                    rows={10}
                    className={`w-full px-4 py-2 border-2 rounded-lg transition-colors bg-white dark:bg-slate-900 text-foreground font-mono text-sm ${
                      errors.content
                        ? "border-destructive bg-destructive/5"
                        : "border-slate-200 dark:border-slate-700 focus:border-primary"
                    }`}
                  />
                  {errors.content && (
                    <p className="text-xs text-destructive mt-1">{errors.content}</p>
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
                      "Submit Blog Post"
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
                  📝 Your blog post will be submitted for approval. Once approved by admins, it will be visible to the community.
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
