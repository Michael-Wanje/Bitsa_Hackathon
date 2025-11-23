"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Mail, Sparkles } from "lucide-react"

export default function CTA() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-secondary/10 to-accent/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float opacity-50"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-float opacity-50"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-30"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="rounded-3xl p-12 sm:p-16 backdrop-blur-md bg-white/10 border border-white/20">
          <div className="inline-flex items-center space-x-2 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 w-full justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Limited Time Offer</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold mb-6 text-center leading-tight">
            Ready to <span className="text-accent font-semibold">join our community</span>?
          </h2>

          <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto text-center leading-relaxed">
            Whether you're a beginner or an experienced developer, there's a place for you at BITSA. Connect with peers,
            learn new skills, and grow together in our thriving tech community.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/auth/register">
              <Button size="lg" className="btn-primary group text-base px-8">
                Register Now
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" className="backdrop-blur-md bg-white/10 border border-white/20 group text-base px-8">
                Get in Touch
                <Mail className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 border-t border-white/10 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              500+ Active Members
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary"></div>
              50+ Events Annually
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              100% Community Driven
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
