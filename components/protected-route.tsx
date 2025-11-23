"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function ProtectedRoute({
  children,
  isAuthenticated = false,
}: {
  children: ReactNode
  isAuthenticated?: boolean
}) {
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary/5 to-background">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-8 max-w-md">
            You need to be logged in to access this page. Please sign in with your BITSA account.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button className="bg-primary hover:bg-primary/90">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline">Register</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
