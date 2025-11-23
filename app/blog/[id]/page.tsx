"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, User, Clock, ArrowLeft, Share2, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

interface BlogPost {
  id: string
  title: string
  content: string
  author: string
  authorBio?: string
  createdAt: string
  category: string
  readTime: number
}

export default function BlogPostPage() {
  const params = useParams()
  const postId = params.id as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const response = await api.blog.getById(postId)
        // Extract blog from nested response structure
        const blog = response.data?.blog || response.blog || response
        if (blog && blog.id) {
          setPost({
            id: blog.id,
            title: blog.title,
            content: blog.content || "",
            author: blog.author?.fullName || blog.author || "Unknown",
            authorBio: blog.author?.bio,
            createdAt: blog.createdAt,
            category: blog.category,
            readTime: Math.ceil((blog.content || "").split(" ").length / 200),
          })

          // Track blog as read
          const readBlogs = JSON.parse(localStorage.getItem("blogsRead") || "[]")
          if (!readBlogs.includes(blog.id)) {
            readBlogs.push(blog.id)
            localStorage.setItem("blogsRead", JSON.stringify(readBlogs))
            // Dispatch custom event to update dashboard in real-time
            window.dispatchEvent(new Event("blogsReadUpdated"))
          }
        } else {
          setError("Blog post not found")
        }
      } catch (err) {
        console.error("[v0] Blog detail fetch error:", err)
        setError("Failed to load blog post")
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId])

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

  if (error || !post) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">{error || "Post not found"}</h1>
            <Link href="/blog">
              <Button>Back to blog</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Navigation />

      <main className="min-h-screen">
        {/* Header */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border bg-linear-to-b from-primary/5 to-transparent">
          <div className="max-w-3xl mx-auto">
            <Link href="/blog" className="inline-flex items-center text-primary hover:text-primary/80 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to blog
            </Link>

            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
              {post.category}
            </span>

            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                {post.author}
              </span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {post.readTime} min read
              </span>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <article className="prose prose-sm sm:prose max-w-none text-foreground">
              {post.content.split("\n\n").map((paragraph, index) => {
                if (paragraph.startsWith("#")) {
                  const level = Math.min(Math.max(paragraph.match(/^#+/)?.[0].length || 1, 1), 5)
                  const text = paragraph.replace(/^#+\s/, "")
                  const Tag = `h${level + 1}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
                  return (
                    <Tag key={index} className="mt-6 mb-4 font-bold text-foreground">
                      {text}
                    </Tag>
                  )
                }
                if (paragraph.startsWith("```")) {
                  return (
                    <pre key={index} className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
                      <code className="text-sm text-foreground">{paragraph.replace(/```/g, "")}</code>
                    </pre>
                  )
                }
                return (
                  <p key={index} className="mb-4 leading-relaxed text-foreground/80">
                    {paragraph}
                  </p>
                )
              })}
            </article>

            {/* Share Section */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Share this post</h3>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 bg-transparent">
                      <Share2 className="w-4 h-4" />
                      {copied ? "Copied!" : "Share"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Author Bio */}
            {post.authorBio && (
              <Card className="mt-12 p-6 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">{post.author}</h4>
                    <p className="text-sm text-muted-foreground">{post.authorBio}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
