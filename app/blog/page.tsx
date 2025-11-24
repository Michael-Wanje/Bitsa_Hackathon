"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, Calendar, User, ArrowRight, Tag, Loader2, BookOpen } from "lucide-react"
import { api } from "@/lib/api"

interface BlogPost {
  id: number
  title: string
  content: string
  author: string
  date: string
  createdAt: string
  category: string
  readTime: number
  image?: string
  thumbnail?: string
}

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<string[]>(["All"])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true)
        const data = await api.blog.getAll({
          search: searchQuery,
          category: selectedCategory === "All" ? undefined : selectedCategory,
        })
        const blogs = (data.data?.blogs || data.blogs || []).map((blog: any) => ({
          ...blog,
          author: blog.author?.fullName || blog.author || "Unknown",
          readTime: Math.ceil((blog.content || "").split(" ").length / 200),
          image: blog.thumbnail || blog.image,
        }))
        setPosts(blogs)

        const uniqueCategories = ["All", ...new Set(blogs.map((p: BlogPost) => p.category))] as string[]
        setCategories(uniqueCategories)
      } catch (err) {
        console.error("[v0] Blog fetch error:", err)
        setError("Failed to load blog posts")
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [searchQuery, selectedCategory])

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || post.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [posts, searchQuery, selectedCategory])

  return (
    <>
      <Navigation />

      <main className="min-h-screen">
        {/* Header */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-primary/5 to-transparent border-b border-border">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">BITSA Blog</h1>
            <p className="text-lg text-muted-foreground">
              Technical insights, tutorials, and updates from our community
            </p>
          </div>
        </section>

        {/* Search and Filter */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-background border-b border-border overflow-x-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  <Tag className="w-3 h-3 inline mr-1" />
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-destructive">{error}</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-foreground mb-2">No posts found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid gap-8">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                    <Link href={`/blog/${post.id}`}>
                      <div className="md:flex">
                        {/* Thumbnail */}
                        <div className="md:w-72 md:shrink-0">
                          {post.image ? (
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-full h-48 md:h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 md:h-full bg-linear-to-br from-primary/20 via-primary/10 to-accent/20 flex items-center justify-center">
                              <BookOpen className="w-16 h-16 text-primary/40" />
                            </div>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="p-8 flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {post.category}
                            </span>
                            <span className="text-sm text-muted-foreground">{post.readTime} min read</span>
                          </div>

                          <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                            {post.title}
                          </h3>

                          <p className="text-foreground/70 mb-6 leading-relaxed">
                            {post.content.substring(0, 150)}...
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                {post.author}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
