"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Mail, Lock, ArrowRight } from "lucide-react"
import { api } from "@/lib/api"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    studentId: "",
    email: "",
    password: "",
    confirmPassword: "",
    course: "Bsc Software Engineering",
    otherCourse: "",
    yearOfStudy: "1",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const checkPasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++
    setPasswordStrength(strength)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === "password") {
      checkPasswordStrength(value)
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.fullName) newErrors.fullName = "Full name is required"
    if (!formData.studentId) newErrors.studentId = "Student ID is required"
    if (!formData.email) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format"
    if (!formData.password) newErrors.password = "Password is required"
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters"
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password"
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      const response = await api.auth.register(
        formData.fullName,
        formData.email,
        formData.password,
        formData.studentId,
        formData.course,
        parseInt(formData.yearOfStudy),
        formData.otherCourse
      )
      
      if (response.success) {
        // Store token and user info
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))
        // Redirect to dashboard
        router.push("/dashboard")
      } else {
        setErrors({ general: response.message || "Registration failed" })
      }
      // Only redirect if token is valid
      useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) {
          api.user.getProfile().then((res) => {
            if (res.success && res.data?.user) {
              window.location.href = "/dashboard"
            } else {
              localStorage.removeItem("token")
              localStorage.removeItem("user")
            }
          }).catch(() => {
            localStorage.removeItem("token")
            localStorage.removeItem("user")
          })
        }
      }, [])
    } catch (err: any) {
      setErrors({ general: err.message || "Network or server error" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="fullName"
              name="fullName"
              placeholder="Your name"
              value={formData.fullName}
              onChange={handleChange}
              className="pl-10"
            />
          </div>
          {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <label htmlFor="studentId" className="block text-sm font-medium text-foreground mb-2">
            Student ID
          </label>
          <Input
            id="studentId"
            name="studentId"
            placeholder="e.g., SABCDE1234"
            value={formData.studentId}
            onChange={handleChange}
          />
          {errors.studentId && <p className="text-xs text-destructive mt-1">{errors.studentId}</p>}
        </div>
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
            placeholder="you@ueab.ac.ke"
            value={formData.email}
            onChange={handleChange}
            className="pl-10"
          />
        </div>
        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="course" className="block text-sm font-medium text-foreground mb-2">
            Course
          </label>
          <select
            id="course"
            name="course"
            value={formData.course}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
          >
            <option>Bsc Software Engineering</option>
            <option>Bsc Data Science</option>
            <option>Bsc Networking and Telecommunication</option>
            <option>Bachelor of Business Information Technology (BBIT)</option>
            <option>Other Course</option>
          </select>
        </div>

        <div>
          <label htmlFor="yearOfStudy" className="block text-sm font-medium text-foreground mb-2">
            Year of Study
          </label>
          <select
            id="yearOfStudy"
            name="yearOfStudy"
            value={formData.yearOfStudy}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
          >
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>
        </div>
      </div>

      {formData.course === "Other Course" && (
        <div>
          <label htmlFor="otherCourse" className="block text-sm font-medium text-foreground mb-2">
            Please specify your course
          </label>
          <Input
            id="otherCourse"
            name="otherCourse"
            placeholder="Enter your course name"
            value={formData.otherCourse}
            onChange={handleChange}
          />
        </div>
      )}

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
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={handleChange}
            className="pl-10"
          />
        </div>
        {formData.password && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-foreground">Password Strength:</span>
              <span className={`text-xs font-semibold ${
                passwordStrength === 1 ? "text-destructive" :
                passwordStrength === 2 ? "text-accent" :
                passwordStrength === 3 ? "text-secondary" :
                "text-primary"
              }`}>
                {passwordStrength === 1 ? "Weak" :
                 passwordStrength === 2 ? "Fair" :
                 passwordStrength === 3 ? "Good" :
                 passwordStrength === 4 ? "Strong" : "Very Weak"}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  passwordStrength === 1 ? "bg-destructive" :
                  passwordStrength === 2 ? "bg-accent" :
                  passwordStrength === 3 ? "bg-secondary" :
                  passwordStrength === 4 ? "bg-primary" : ""
                }`}
                style={{ width: `${(passwordStrength / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
        {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="pl-10"
          />
        </div>
        {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>}
      </div>

      <label className="flex items-start space-x-3 cursor-pointer">
        <input type="checkbox" className="mt-1 rounded border-border" required />
        <span className="text-sm text-foreground">
          I agree to the{" "}
          <Link href="#" className="text-primary hover:text-primary/80">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-primary hover:text-primary/80">
            Privacy Policy
          </Link>
        </span>
      </label>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isLoading ? "Creating account..." : "Create Account"}
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>

      <p className="text-center text-sm text-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
          Sign in
        </Link>
      </p>
    </form>
  )
}
