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

export default function AdminEditBlogPage() {
  const router = useRouter()
  const params = useParams()
  const blogId = Number(params.id)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Technology",
    thumbnail: "",
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

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true)
        const response = await api.blog.getById(String(blogId))
        if (response.success || response.data) {
          const blog = response.data?.blog || response
          setFormData({
            title: blog.title || "",
            content: blog.content || "",
            category: blog.category || "Technology",
            thumbnail: blog.thumbnail || "",
          })
        } else {
          alert("Failed to load blog post")
          router.push("/admin/blog")
        }
      } catch (error) {
        console.error("Fetch blog error:", error)
        alert("Error loading blog post")
        router.push("/admin/blog")
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()
  }, [blogId, router])

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

    setSaving(true)
    try {
      const response = await api.blog.update(String(blogId), {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        thumbnail: formData.thumbnail || undefined,
      })

      if (response.success) {
        alert("Blog post updated successfully!")
        router.push("/admin/blog")
      } else {
        alert(response.message || "Failed to update blog post")
      }
    } catch (error) {
      console.error("Update blog error:", error)
      alert("Error updating blog post. Please try again.")
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

      <main className="min-h-screen pb-12 bg-linear-to-b from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
        {/* Header */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-primary via-blue-600 to-primary dark:from-primary/80 dark:via-blue-700 dark:to-primary/80 border-b border-primary/20 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <Link href="/admin/blog" className="inline-flex items-center text-white hover:text-white/80 mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to blog management
            </Link>
            <h1 className="text-5xl font-bold text-white mb-2">Edit Blog Post</h1>
            <p className="text-white/80">Update the blog post details</p>
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
                    Blog Title *
                  </label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter a compelling title..."
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
                    className={`w-full px-4 py-2 border rounded-md bg-background text-foreground ${
                      errors.category ? "border-destructive" : "border-input"
                    }`}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-destructive text-sm mt-1">{errors.category}</p>}
                </div>

                {/* Image URL */}
                <div>
                  <label htmlFor="thumbnail" className="block text-sm font-medium text-foreground mb-2">
                    Image URL (optional)
                  </label>
                  <Input
                    id="thumbnail"
                    name="thumbnail"
                    type="url"
                    value={formData.thumbnail}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Content */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-foreground mb-2">
                    Content *
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Write your blog post content here..."
                    rows={12}
                    className={`w-full px-4 py-2 border rounded-md bg-background text-foreground font-mono text-sm ${
                      errors.content ? "border-destructive" : "border-input"
                    }`}
                  />
                  {errors.content && <p className="text-destructive text-sm mt-1">{errors.content}</p>}
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Update Blog Post"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/blog")}
                    disabled={saving}
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
