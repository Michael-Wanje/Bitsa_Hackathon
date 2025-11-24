"use client"

import type React from "react"

import { api } from "@/lib/api"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log("LoginPage component mounted")
    
    // Check if user is already logged in
    const token = localStorage.getItem("token")
    if (token) {
      console.log("User already has token, verifying...")
      // Don't auto-redirect, let them login again if token is invalid
      // This prevents redirect loops
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.email) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format"
    if (!formData.password) newErrors.password = "Password is required"
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("=== FORM SUBMITTED ===")
    e.preventDefault()
    
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      console.log("Validation errors:", newErrors)
      setErrors(newErrors)
      return
    }

    console.log("Starting login request...")
    setIsLoading(true)
    
    try {
      console.log("Calling API with:", { email: formData.email })
      const response = await api.auth.login(formData.email, formData.password)
      console.log("=== API RESPONSE ===", response)
      
      if (response?.success === true) {
        console.log("✅ Login successful!")
        
        // Check user role and redirect accordingly
        const user = response.data?.user
        const role = user?.role
        console.log("User role:", role)
        
        if (role === "ADMIN") {
          console.log("Redirecting to admin dashboard...")
          window.location.href = "/admin"
        } else {
          console.log("Redirecting to student dashboard...")
          window.location.href = "/dashboard"
        }
      } else {
        const errorMessage = response?.message || response?.error || "Login failed"
        console.log("❌ Login failed:", errorMessage)
        setErrors({ general: errorMessage })
      }
    } catch (err: any) {
      console.log("❌ Exception:", err)
      const errorMessage = err.message || "Network or server error"
      setErrors({ general: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md">
          <p className="text-sm text-destructive">{errors.general}</p>
        </div>
      )}
      
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
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            className="pl-10"
          />
        </div>
        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            className="pl-10"
          />
        </div>
        {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input 
            id="rememberMe"
            name="rememberMe"
            type="checkbox" 
            className="rounded border-border" 
          />
          <span className="text-foreground">Remember me</span>
        </label>
        <Link href="/auth/forgot-password" className="text-primary hover:text-primary/80 transition-colors">
          Forgot password?
        </Link>
      </div>

      <Button
        type="button"
        disabled={isLoading}
        onClick={async () => {
          console.log("✅ BUTTON CLICKED")
          const newErrors = validateForm()
          if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
          }
          
          setIsLoading(true)
          try {
            const response = await api.auth.login(formData.email, formData.password)
            console.log("✅ Full Response:", JSON.stringify(response, null, 2))
            console.log("✅ Success?", response?.success)
            console.log("✅ Data:", response?.data)
            console.log("✅ Token:", response?.data?.token)
            
            if (response?.success) {
              console.log("✅ LOGIN SUCCESS!")
              // Check user role and redirect accordingly
              const user = response.data?.user
              const role = user?.role
              console.log("User role:", role)
              
              if (role === "ADMIN") {
                console.log("Redirecting to admin dashboard...")
                window.location.replace("/admin")
              } else {
                console.log("Redirecting to student dashboard...")
                window.location.replace("/dashboard")
              }
            } else {
              console.log("❌ LOGIN FAILED:", response?.message)
              setErrors({ general: response?.message || "Login failed" })
            }
          } catch (err: any) {
            console.error("❌ EXCEPTION:", err)
            setErrors({ general: err.message || "Error" })
          } finally {
            setIsLoading(false)
          }
        }}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isLoading ? "Signing in..." : "Sign In"}
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-card text-muted-foreground">or</span>
        </div>
      </div>

      <p className="text-center text-sm text-foreground">
        Don't have an account?{" "}
        <Link href="/auth/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
          Register here
        </Link>
      </p>
    </form>
  )
}
