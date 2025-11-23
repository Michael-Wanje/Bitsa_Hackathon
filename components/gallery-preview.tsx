"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Images, ArrowRight } from "lucide-react"

export default function GalleryPreview() {
  const photos = [
    {
      title: "TechConf 2024",
      event: "Tech Conference",
      description: "Opening keynote capturing innovation and collaboration",
    },
    {
      title: "Hackathon Finals",
      event: "Hackathon",
      description: "Creative problem-solving at its finest",
    },
    {
      title: "Community Meetup",
      event: "Networking",
      description: "Building connections across our community",
    },
  ]

  return (
    <div className="rounded-2xl p-8 backdrop-blur-md bg-white/10 border border-white/20 group card-hover-lift">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center group-hover:shadow-lg group-hover:shadow-accent/30 transition-all duration-300">
          <Images className="w-7 h-7 text-accent-foreground" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-foreground">Photo Gallery</h3>
          <p className="text-sm text-muted-foreground mt-1">Latest memories</p>
        </div>
      </div>

      <div className="space-y-3 mb-6 border-t border-white/10 pt-6">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="group/item p-4 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer border border-transparent hover:border-white/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground group-hover/item:text-accent transition-colors">
                  {photo.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{photo.event}</p>
                <p className="text-xs text-muted-foreground/80 mt-2 line-clamp-2">{photo.description}</p>
              </div>
              <div className="text-2xl text-accent/20 group-hover/item:text-accent/40 transition-colors">→</div>
            </div>
          </div>
        ))}
      </div>

      <Link href="/gallery" className="block">
        <Button className="btn-primary w-full justify-between group/btn">
          View Gallery
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </Link>
    </div>
  )
}
