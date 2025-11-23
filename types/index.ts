export interface User {
  id: string
  name: string
  email: string
  studentId: string
  course: string
  yearOfStudy: string
  role: "user" | "admin"
  createdAt: Date
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  authorBio: string
  date: string
  category: string
  readTime: number
  status: "published" | "draft"
  createdAt: Date
  updatedAt: Date
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  attendees: number
  category: string
  isPast: boolean
  createdAt: Date
  updatedAt: Date
}

export interface GalleryPhoto {
  id: string
  title: string
  event: string
  year: number
  caption: string
  image: string
  uploadedAt: Date
}
