// Authentication utilities
// In a real application, this would handle JWT tokens or session management

export const setAuthCookie = (token: string) => {
  // Set authentication cookie
  if (typeof window !== "undefined") {
    document.cookie = `auth_token=${token}; path=/; max-age=${30 * 24 * 60 * 60}`
  }
}

export const removeAuthCookie = () => {
  // Remove authentication cookie
  if (typeof window !== "undefined") {
    document.cookie = "auth_token=; path=/; max-age=0"
  }
}

export const getAuthToken = () => {
  // Get authentication token from cookie
  if (typeof window !== "undefined") {
    const cookies = document.cookie.split(";")
    const token = cookies.find((cookie) => cookie.trim().startsWith("auth_token="))
    return token?.split("=")[1]
  }
  return null
}

export const isAuthenticated = () => {
  return getAuthToken() !== null
}
