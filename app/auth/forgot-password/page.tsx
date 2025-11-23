"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, ArrowRight, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError("Email is required")
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email format")
      return
    }

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      console.log("Password reset requested for:", email)
      setIsLoading(false)
      setIsSubmitted(true)
    }, 1000)
  }

  if (isSubmitted) {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Check your email</h2>
          <p className="text-muted-foreground">
            We've sent a password reset link to <strong>{email}</strong>. Please check your email and follow the
            instructions to reset your password.
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-foreground">
          <p className="font-medium mb-2">Didn't receive the email?</p>
          <p className="text-muted-foreground mb-4">
            Check your spam folder or try again with a different email address.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsSubmitted(false)
              setEmail("")
            }}
          >
            Try another email
          </Button>
        </div>

        <Link href="/auth/login" className="inline-block text-primary hover:text-primary/80 font-medium">
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Reset your password</h2>
        <p className="text-muted-foreground text-sm">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={handleChange}
            className="pl-10"
          />
        </div>
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isLoading ? "Sending..." : "Send Reset Link"}
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>

      <p className="text-center text-sm text-foreground">
        Remember your password?{" "}
        <Link href="/auth/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
          Sign in
        </Link>
      </p>
    </form>
  )
}
