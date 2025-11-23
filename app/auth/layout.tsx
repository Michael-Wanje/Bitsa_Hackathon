"use client"

import type React from "react"

import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-base font-bold text-primary-foreground">B</span>
            </div>
            <span className="font-bold text-xl text-foreground">BITSA</span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Welcome</h1>
          <p className="text-muted-foreground mt-2">Join our tech community</p>
        </div>

        {/* Auth Form */}
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">{children}</div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
