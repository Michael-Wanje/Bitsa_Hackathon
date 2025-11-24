"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowRight, Eye, MessageCircle, Clock, Calendar, User } from "lucide-react"
import { api } from "@/lib/api"

interface BlogPost {
  id: number
  title: string
  content: string
  createdAt: string
  category: string
  author?: {
    fullName: string
  }
}

export default function BlogPreview() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await api.blog.getAll({ limit: 3 })
        const blogs = response.data?.blogs || response.blogs || []
        setPosts(blogs)
      } catch (err) {
        console.error(err)
        setError("Error loading blogs")
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  if (loading) {
    return (
      <div className="rounded-2xl p-8 backdrop-blur-md bg-white/10 border border-white/20 animate-pulse">
        <div className="h-20 bg-muted rounded-lg mb-4"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-8 backdrop-blur-md bg-white/10 border border-white/20 group">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:shadow-lg transition-all duration-300">
          <BookOpen className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-foreground">Latest Blogs</h3>
          <p className="text-sm text-muted-foreground mt-1">Insights from our community</p>
        </div>
      </div>

      {posts.length === 0 && !error && (
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No blogs available yet</p>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => {
          const readTime = Math.ceil((post.content || "").split(" ").length / 200)
          const excerpt = post.content.substring(0, 120) + "..."
          
          return (
            <Link key={post.id} href={`/blog/${post.id}`} className="group/post block">
              <div className="p-4 rounded-lg border border-border hover:border-primary/30 bg-muted/30 hover:bg-muted/50 transition-all duration-300 cursor-pointer">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="font-bold text-foreground group-hover/post:text-primary transition-colors duration-300 text-sm leading-tight mb-2">
                      {post.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{excerpt}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {readTime} min
                    </div>
                    {post.author?.fullName && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author.fullName}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover/post:opacity-100 transition-all duration-300 translate-x-0 group-hover/post:translate-x-1 text-primary" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {error && <p className="text-destructive text-sm mt-4">{error}</p>}

      <Link href="/blog" className="mt-6 block">
        <Button className="w-full justify-between">
          Read Full Blog
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </div>
  )
}
