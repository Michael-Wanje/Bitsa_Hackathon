"use client"

import Navigation from "@/components/navigation"
import Hero from "@/components/hero"
import EventPreview from "@/components/event-preview"
import BlogPreview from "@/components/blog-preview"
import GalleryPreview from "@/components/gallery-preview"
import CTA from "@/components/cta"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Hero />

      {/* CHANGE: Enhanced preview sections with bento-grid-inspired layout */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* CHANGE: Decorative background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* CHANGE: Section header with gradient */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Explore BITSA
              <span className="text-primary"> Experience</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Discover upcoming events, read our latest insights, and explore our vibrant community through our photo
              gallery.
            </p>
          </div>

          {/* CHANGE: Improved responsive grid - stacks on mobile, 2 cols on tablet, 3 cols on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <EventPreview />
            </div>
            <div>
              <BlogPreview />
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <GalleryPreview />
            </div>
          </div>
        </div>
      </section>

      <CTA />
      <Footer />
    </main>
  )
}
