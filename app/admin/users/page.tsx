"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Search, Edit, Trash2, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

interface User {
  id: number
  name: string
  email: string
  studentId?: string
  course?: string
  joinDate: string
  status: "active" | "inactive"
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await api.admin.getUsers({ search: searchQuery, limit: 50 })
        if (response.success) {
          // Extract users array from nested data structure and map to expected format
          const usersArray = (response.data?.users || []).map((u: any) => ({
            id: u.id,
            name: u.fullName,
            email: u.email,
            studentId: u.studentId,
            course: u.course,
            joinDate: u.createdAt,
            status: "active" as const,
          }))
          setUsers(usersArray)
        } else {
          setError("Failed to load users")
        }
      } catch (err) {
        console.error("[v0] Fetch users error:", err)
        setError("Failed to load users")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [searchQuery])

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false),
  )

  return (
    <>
      <Navigation />

      <main className="min-h-screen pb-12">
        {/* Header */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-primary/5 to-transparent border-b border-border">
          <div className="max-w-6xl mx-auto">
            <Link href="/admin" className="inline-flex items-center text-primary hover:text-primary/80 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to admin
            </Link>
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold text-foreground">Manage Users</h1>
              <div className="text-sm text-muted-foreground">
                Total Users: <span className="font-bold text-foreground">{users.length}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Search */}
            <div className="mb-8 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or student ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            {error && <Card className="p-6 bg-destructive/10 border-destructive text-destructive">{error}</Card>}

            {!loading && !error && (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="text-left px-6 py-4 font-semibold text-foreground">Name</th>
                        <th className="text-left px-6 py-4 font-semibold text-foreground">Email</th>
                        <th className="text-left px-6 py-4 font-semibold text-foreground">Student ID</th>
                        <th className="text-left px-6 py-4 font-semibold text-foreground">Status</th>
                        <th className="text-left px-6 py-4 font-semibold text-foreground">Joined</th>
                        <th className="text-right px-6 py-4 font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-foreground">{user.name}</td>
                          <td className="px-6 py-4 text-muted-foreground text-sm break-all">{user.email}</td>
                          <td className="px-6 py-4 text-muted-foreground text-sm">{user.studentId || "—"}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                user.status === "active"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                              }`}
                            >
                              {user.status === "active" ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground text-sm">{user.joinDate}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" className="gap-2">
                                <Edit className="w-4 h-4" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {!loading && !error && filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No users found matching your search.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
