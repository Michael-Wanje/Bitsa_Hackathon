"use client"

import type React from "react"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactForm>({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name) newErrors.name = "Name is required"
    if (!formData.email) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format"
    if (!formData.subject) newErrors.subject = "Subject is required"
    if (!formData.message) newErrors.message = "Message is required"
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
      await api.contact.submit(formData)
      setIsSubmitted(true)
      setTimeout(() => {
        setFormData({ name: "", email: "", subject: "", message: "" })
        setIsSubmitted(false)
      }, 3000)
    } catch (err) {
      console.error("[v0] Contact form error:", err)
      setErrors({ submit: "Failed to send message. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const contacts = [
    {
      icon: Mail,
      label: "Email",
      value: "bitsaclub@ueab.ac.ke",
      href: "mailto:bitsaclub@ueab.ac.ke",
    },
    {
      icon: Phone,
      label: "President",
      value: "+254 708 898 899",
      href: "tel:+254708898899",
    },
    {
      icon: Phone,
      label: "Vice President",
      value: "+254 725 486 687",
      href: "tel:+254725486687",
    },
    {
      icon: MapPin,
      label: "Location",
      value: "UEAB Campus, Nairobi",
      href: "#",
    },
  ]

  if (isSubmitted) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen flex items-center justify-center px-4">
          <Card className="max-w-md w-full p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-6">
              Your message has been sent successfully. We'll get back to you soon.
            </p>
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => setIsSubmitted(false)}>
              Send Another Message
            </Button>
          </Card>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navigation />

      <main className="min-h-screen pb-12">
        {/* Header */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-transparent border-b border-border">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Get In Touch</h1>
            <p className="text-lg text-muted-foreground">Have questions or feedback? We'd love to hear from you!</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {contacts.map((contact) => {
                const Icon = contact.icon
                return (
                  <Card key={contact.label} className="p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{contact.label}</h3>
                    <a href={contact.href} className="text-primary hover:text-primary/80 text-sm break-all">
                      {contact.value}
                    </a>
                  </Card>
                )
              })}
            </div>

            {/* Contact Form */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-8">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className={errors.name ? "border-destructive" : ""}
                      disabled={isLoading}
                    />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className={errors.email ? "border-destructive" : ""}
                      disabled={isLoading}
                    />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this about?"
                    className={errors.subject ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message here..."
                    disabled={isLoading}
                    className={`w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.message ? "border-destructive" : "border-border"
                    }`}
                  />
                  {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
                </div>

                {errors.submit && <p className="text-xs text-destructive">{errors.submit}</p>}

                <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
