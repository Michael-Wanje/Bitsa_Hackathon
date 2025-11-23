"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

interface BlogPost {
  id: number
  title: string
  author: string
  category: string
  date: string
  status: "published" | "draft"
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await api.blog.getAll({ limit: 50 })
      if (response.success) {
        // Extract blogs array from nested data structure and map to expected format
        const blogsArray = (response.data?.blogs || []).map((blog: any) => ({
          id: blog.id,
          title: blog.title,
          author: blog.author?.fullName || "Unknown",
          category: blog.category,
          date: blog.createdAt,
          status: blog.status === "APPROVED" ? "published" : "draft",
        }))
        setPosts(blogsArray)
      } else {
        setError("Failed to load blog posts")
      }
    } catch (err) {
      console.error("[v0] Fetch blog posts error:", err)
      setError("Failed to load blog posts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return

    try {
      const response = await api.blog.delete(id.toString())
      if (response.success) {
        alert("Blog post deleted successfully")
        fetchPosts()
      } else {
        alert(response.message || "Failed to delete blog post")
      }
    } catch (error) {
      console.error("Delete blog error:", error)
      alert("Error deleting blog post")
    }
  }

  return (
    <>
      <Navigation />

      <main className="min-h-screen pb-12">
        {/* Header */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-primary/5 to-transparent border-b border-border">
          <div className="max-w-6xl mx-auto">
            <Link href="/admin" className="inline-flex items-center text-primary hover:text-primary/80 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to admin
            </Link>
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold text-foreground">Manage Blog Posts</h1>
              <Link href="/admin/blog/create">
                <Button className="bg-primary hover:bg-primary/90 gap-2">
                  <Plus className="w-4 h-4" />
                  New Post
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            {error && <Card className="p-6 bg-destructive/10 border-destructive text-destructive">{error}</Card>}

            {!loading && !error && (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-foreground">{post.title}</h3>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              post.status === "published"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}
                          >
                            {post.status}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            By {post.author} in {post.category}
                          </p>
                          <p>{post.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/blog/${post.id}`} target="_blank">
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/admin/blog/edit/${post.id}`}>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!loading && !error && posts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No blog posts found.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
