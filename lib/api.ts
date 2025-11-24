const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null
}

function getAuthHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Auth API
const authAPI = {
  login: async (email: string, password: string) => {
    console.log("🔵 API: Starting login request")
    console.log("🔵 API: URL =", `${API_URL}/auth/login`)
    console.log("🔵 API: Email =", email)
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      
      console.log("🔵 API: Response status =", response.status)
      console.log("🔵 API: Response ok =", response.ok)
      
      const data = await response.json()
      console.log("🔵 API: Parsed data =", data)
      
      if (data.success) {
        console.log("🔵 API: Storing token in localStorage AND cookie")
        localStorage.setItem("token", data.data.token)
        localStorage.setItem("user", JSON.stringify(data.data.user))
        // Set cookie for middleware authentication check
        document.cookie = `auth_token=${data.data.token}; path=/; max-age=604800; SameSite=Lax`
      }
      
      console.log("🔵 API: Returning data")
      return data
    } catch (error) {
      console.error("🔴 API: Exception =", error)
      throw error
    }
  },

  register: async (name: string, email: string, password: string, studentId: string, course: string, yearOfStudy: number, otherCourse?: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name, 
        email, 
        password,
        studentId,
        course: course === "Other Course" ? otherCourse : course,
        yearOfStudy: parseInt(yearOfStudy.toString())
      }),
    })
    const data = await response.json()
    if (data.success) {
      localStorage.setItem("token", data.data.token)
      localStorage.setItem("user", JSON.stringify(data.data.user))
      // Set cookie for middleware authentication check
      document.cookie = `auth_token=${data.data.token}; path=/; max-age=604800; SameSite=Lax`
    }
    return data
  },

  logout: () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    // Remove auth cookie
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  },
}

// Blog API
const blogAPI = {
  getAll: async (options?: { search?: string; category?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams({
      page: (options?.page || 1).toString(),
      limit: (options?.limit || 10).toString(),
    })
    if (options?.search) params.append("search", options.search)
    if (options?.category) params.append("category", options.category)

    const response = await fetch(`${API_URL}/blogs?${params}`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  getMyBlogs: async (options?: { page?: number; limit?: number }) => {
    const params = new URLSearchParams({
      page: (options?.page || 1).toString(),
      limit: (options?.limit || 10).toString(),
    })

    const response = await fetch(`${API_URL}/blogs/my-blogs?${params}`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  getPendingBlogs: async (options?: { page?: number; limit?: number }) => {
    const params = new URLSearchParams({
      page: (options?.page || 1).toString(),
      limit: (options?.limit || 10).toString(),
    })

    const response = await fetch(`${API_URL}/blogs/admin/pending?${params}`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/blogs/${id}`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  create: async (data: { title: string; content: string; category: string; excerpt?: string; imageUrl?: string; thumbnail?: string }) => {
    const response = await fetch(`${API_URL}/blogs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  update: async (id: string, data: Partial<{ title: string; content: string; category: string; thumbnail: string }>) => {
    const response = await fetch(`${API_URL}/blogs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/blogs/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  approve: async (id: string) => {
    const response = await fetch(`${API_URL}/blogs/${id}/approve`, {
      method: "POST",
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  reject: async (id: string) => {
    const response = await fetch(`${API_URL}/blogs/${id}/reject`, {
      method: "POST",
      headers: getAuthHeaders(),
    })
    return response.json()
  },
}

// Events API
const eventsAPI = {
  getAll: async (options?: { search?: string; category?: string; isPast?: boolean; page?: number; limit?: number }) => {
    const params = new URLSearchParams({
      page: (options?.page || 1).toString(),
      limit: (options?.limit || 10).toString(),
    })
    if (options?.search) params.append("search", options.search)
    if (options?.category) params.append("category", options.category)
    if (options?.isPast !== undefined) params.append("isPast", options.isPast.toString())

    const response = await fetch(`${API_URL}/events?${params}`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  getMyEvents: async (options?: { page?: number; limit?: number }) => {
    const params = new URLSearchParams({
      page: (options?.page || 1).toString(),
      limit: (options?.limit || 10).toString(),
    })

    const response = await fetch(`${API_URL}/events/my-events?${params}`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  getPendingEvents: async (options?: { page?: number; limit?: number }) => {
    const params = new URLSearchParams({
      page: (options?.page || 1).toString(),
      limit: (options?.limit || 10).toString(),
    })

    const response = await fetch(`${API_URL}/events/admin/pending?${params}`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/events/${id}`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  create: async (data: { title: string; description: string; date: string; time: string; endTime?: string; location: string; category: string; imageUrl?: string }) => {
    const response = await fetch(`${API_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  update: async (id: string, data: Partial<{ title: string; description: string; date: string; time: string; endTime: string; location: string; imageUrl: string }>) => {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  approve: async (id: string) => {
    const response = await fetch(`${API_URL}/events/${id}/approve`, {
      method: "POST",
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  reject: async (id: string) => {
    const response = await fetch(`${API_URL}/events/${id}/reject`, {
      method: "POST",
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  register: async (eventId: string) => {
    const response = await fetch(`${API_URL}/events/${eventId}/register`, {
      method: "POST",
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  getUserRegistrations: async () => {
    const response = await fetch(`${API_URL}/events/user/registrations`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  getAttendees: async (eventId: number) => {
    const response = await fetch(`${API_URL}/events/${eventId}/attendees`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },
}

// Gallery API
const galleryAPI = {
  getAll: async (options?: { event?: string; year?: number; page?: number; limit?: number }) => {
    const params = new URLSearchParams({
      page: (options?.page || 1).toString(),
      limit: (options?.limit || 12).toString(),
    })
    if (options?.event) params.append("event", options.event)
    if (options?.year) params.append("year", options.year.toString())

    const response = await fetch(`${API_URL}/gallery?${params}`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/gallery/${id}`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  upload: async (formData: FormData) => {
    const response = await fetch(`${API_URL}/gallery`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    })
    return response.json()
  },

  update: async (id: string, data: { caption?: string; description?: string }) => {
    const response = await fetch(`${API_URL}/gallery/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/gallery/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    return response.json()
  },
}

// Contact API
const contactAPI = {
  submit: async (data: { name: string; email: string; subject: string; message: string }) => {
    const response = await fetch(`${API_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  getAll: async (options?: { page?: number; limit?: number }) => {
    const params = new URLSearchParams({
      page: (options?.page || 1).toString(),
      limit: (options?.limit || 10).toString(),
    })

    const response = await fetch(`${API_URL}/contact?${params}`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  markAsRead: async (id: string) => {
    const response = await fetch(`${API_URL}/contact/${id}/read`, {
      method: "PUT",
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/contact/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    return response.json()
  },
}

// Admin API
const adminAPI = {
  getDashboard: async () => {
    const response = await fetch(`${API_URL}/admin/stats`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  getUsers: async (options?: { page?: number; limit?: number; search?: string }) => {
    const params = new URLSearchParams({
      page: (options?.page || 1).toString(),
      limit: (options?.limit || 10).toString(),
    })
    if (options?.search) params.append("search", options.search)

    const response = await fetch(`${API_URL}/admin/users?${params}`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  updateUser: async (id: string, data: Partial<{ name: string; email: string; role: string }>) => {
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  deleteUser: async (id: string) => {
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    return response.json()
  },
}

// User API
const userAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getAuthHeaders(),
    })
    const data = await response.json()
    
    // If unauthorized, throw error to trigger cleanup in dashboard
    if (!response.ok && (response.status === 401 || response.status === 403)) {
      throw new Error("Unauthorized - 401")
    }
    
    return data
  },

  updateProfile: async (userId: string, data: Partial<{ fullName: string; phoneNumber?: string; bio?: string }>) => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    return response.json()
  },

  deleteAccount: async () => {
    const response = await fetch(`${API_URL}/users/account/delete`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    return response.json()
  },
}

// Stats API (public)
const statsAPI = {
  getPublic: async () => {
    const response = await fetch(`${API_URL}/stats/public`, {
      method: "GET",
    })
    return response.json()
  },
}

export const api = {
  auth: authAPI,
  blog: blogAPI,
  events: eventsAPI,
  gallery: galleryAPI,
  contact: contactAPI,
  admin: adminAPI,
  user: userAPI,
  stats: statsAPI,
}

// Also export individual functions for backward compatibility
export const { login, register, logout } = authAPI
export { getToken, getAuthHeaders }

export const getBlogs = blogAPI.getAll
export const getEvents = eventsAPI.getAll
