"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Save, Mail, Phone, Lock, LogOut, Loader2, AlertTriangle, Eye, EyeOff } from "lucide-react"
import { api } from "@/lib/api"

interface UserProfile {
  fullName: string
  email: string
  studentId: string
  course: string
  yearOfStudy: number
  phoneNumber?: string
  bio?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string>("") 
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<UserProfile>({
    fullName: "",
    email: "",
    studentId: "",
    course: "",
    yearOfStudy: 1,
    phoneNumber: "",
    bio: "",
  })
  const [originalData, setOriginalData] = useState<UserProfile | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/auth/login")
          return
        }

        const response = await api.user.getProfile()
        if (response.success && response.data?.user) {
          const user = response.data.user
          setUserId(user.id)
          const profileData = {
            fullName: user.fullName || "",
            email: user.email || "",
            studentId: user.studentId || "",
            course: user.course || "",
            yearOfStudy: user.yearOfStudy || 1,
            phoneNumber: user.phoneNumber || "",
            bio: user.bio || "",
          }
          setFormData(profileData)
          setOriginalData(profileData)
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.fullName?.trim()) newErrors.fullName = "Full name is required"
    if (formData.phoneNumber && !/^[0-9+\-\s()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number format"
    }
    return newErrors
  }

  const handleSave = async () => {
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSaving(true)
    try {
      const response = await api.user.updateProfile(userId, {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        bio: formData.bio,
      })
      
      if (response.success) {
        // Update localStorage with the new user data
        const updatedUser = response.data?.user
        if (updatedUser) {
          localStorage.setItem("user", JSON.stringify(updatedUser))
        }
        
        setOriginalData(formData)
        setIsEditing(false)
        alert("Profile updated successfully!")
      } else {
        alert(response.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Save error:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogoutAll = () => {
    api.auth.logout()
    router.push("/auth/login")
  }

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    setIsSaving(true)
    try {
      const response = await api.user.deleteAccount()
      
      if (response.success) {
        // Clear all auth data
        api.auth.logout()
        alert("Account deleted successfully. You will not be able to log in with this account.")
        router.push("/auth/login")
      } else {
        alert(response.message || "Failed to delete account")
        setShowDeleteConfirm(false)
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete account. Please try again.")
      setShowDeleteConfirm(false)
    } finally {
      setIsSaving(false)
    }
  }

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {}
    if (!passwordForm.currentPassword) newErrors.currentPassword = "Current password is required"
    if (!passwordForm.newPassword) newErrors.newPassword = "New password is required"
    if (passwordForm.newPassword.length < 8) newErrors.newPassword = "Password must be at least 8 characters"
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      newErrors.newPassword = "New password must be different from current password"
    }
    return newErrors
  }

  const handleChangePassword = async () => {
    const newErrors = validatePasswordForm()
    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors)
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await api.user.changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      
      if (response.success) {
        setShowPasswordModal(false)
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setPasswordErrors({})
        alert("Password changed successfully!")
      } else {
        alert(response.message || "Failed to change password")
      }
    } catch (error) {
      console.error("Password change error:", error)
      alert("Failed to change password. Please try again.")
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navigation />

      <main className="min-h-screen pb-12 bg-linear-to-b from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
        {/* Header */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-primary via-blue-600 to-primary dark:from-primary/80 dark:via-blue-700 dark:to-primary/80 border-b border-primary/20 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <Link href="/dashboard" className="inline-flex items-center text-white hover:text-white/80 mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to dashboard
            </Link>
            <h1 className="text-5xl font-bold text-white mb-2">My Profile</h1>
            <p className="text-white/80">Manage your account information and settings</p>
          </div>
        </section>

        {/* Profile Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Profile Information */}
            <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-2xl font-bold bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">Profile Information</h2>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} className="bg-primary hover:bg-primary/90">
                    Edit Profile
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                    {isEditing ? (
                      <>
                        <Input
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className={`border-2 transition-colors ${errors.fullName ? "border-destructive bg-destructive/5" : "border-slate-200 dark:border-slate-700 focus:border-primary"}`}
                        />
                        {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
                      </>
                    ) : (
                      <p className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-foreground font-medium">{formData.fullName}</p>
                    )}
                  </div>

                  {/* Student ID - Read Only */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      Student ID
                    </label>
                    <p className="bg-primary/10 dark:bg-primary/20 px-4 py-2 rounded-lg text-foreground font-medium border border-primary/20">
                      {formData.studentId}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Email - Read Only */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-500" />
                      Email Address
                    </label>
                    <p className="bg-blue-50 dark:bg-blue-950/30 px-4 py-2 rounded-lg text-foreground font-medium border border-blue-200 dark:border-blue-800">{formData.email}</p>
                  </div>

                  {/* Phone Number - Editable */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-green-500" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <>
                        <Input
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          className={`border-2 transition-colors ${errors.phoneNumber ? "border-destructive bg-destructive/5" : "border-slate-200 dark:border-slate-700 focus:border-primary"}`}
                        />
                        {errors.phoneNumber && <p className="text-xs text-destructive mt-1">{errors.phoneNumber}</p>}
                      </>
                    ) : (
                      <p className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-foreground font-medium">{formData.phoneNumber || "Not provided"}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Course - Read Only */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      Course
                    </label>
                    <p className="bg-purple-50 dark:bg-purple-950/30 px-4 py-2 rounded-lg text-foreground font-medium border border-purple-200 dark:border-purple-800">
                      {formData.course}
                    </p>
                  </div>

                  {/* Year of Study - Read Only */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      Year of Study
                    </label>
                    <p className="bg-amber-50 dark:bg-amber-950/30 px-4 py-2 rounded-lg text-foreground font-medium border border-amber-200 dark:border-amber-800">
                      Year {formData.yearOfStudy}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-foreground focus:border-primary transition-colors"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-lg text-foreground whitespace-pre-wrap italic text-sm">{formData.bio || "No bio provided"}</p>
                  )}
                </div>

                {/* Save/Cancel Buttons */}
                {isEditing && (
                  <div className="flex gap-4">
                    <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90 gap-2">
                      <Save className="w-4 h-4" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        setErrors({})
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Security Settings */}
            <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-bold bg-linear-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-6">Security</h2>
              <div className="space-y-4">
                <Button 
                  onClick={() => setShowPasswordModal(true)} 
                  variant="outline" 
                  className="w-full justify-start gap-2 bg-transparent"
                >
                  <Lock className="w-4 h-4" />
                  Change Password
                </Button>
                <p className="text-sm text-muted-foreground">
                  We recommend changing your password periodically for better security.
                </p>
              </div>
            </Card>

            {/* Change Password Modal */}
            <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and set a new one
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center justify-between">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => {
                          setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                          if (passwordErrors.currentPassword) {
                            setPasswordErrors({ ...passwordErrors, currentPassword: "" })
                          }
                        }}
                        placeholder="Enter current password"
                        className={passwordErrors.currentPassword ? "border-destructive pr-10" : "pr-10"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-xs text-destructive mt-1">{passwordErrors.currentPassword}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2">New Password</label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => {
                          setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                          if (passwordErrors.newPassword) {
                            setPasswordErrors({ ...passwordErrors, newPassword: "" })
                          }
                        }}
                        placeholder="Enter new password"
                        className={passwordErrors.newPassword ? "border-destructive pr-10" : "pr-10"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-xs text-destructive mt-1">{passwordErrors.newPassword}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2">Confirm New Password</label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => {
                          setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                          if (passwordErrors.confirmPassword) {
                            setPasswordErrors({ ...passwordErrors, confirmPassword: "" })
                          }
                        }}
                        placeholder="Confirm new password"
                        className={passwordErrors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-xs text-destructive mt-1">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPasswordModal(false)
                      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
                      setPasswordErrors({})
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isChangingPassword ? "Changing..." : "Change Password"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Danger Zone */}
            <Card className="p-8 border-2 border-red-200 dark:border-red-900/30 bg-linear-to-br from-red-50 to-red-50/50 dark:from-red-950/20 dark:to-red-950/10 shadow-md">
              <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-6 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </h2>
              <div className="space-y-4">
                <div>
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start gap-2"
                    onClick={handleLogoutAll}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout from All Devices
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    This will log you out from all devices and you'll need to sign in again.
                  </p>
                </div>
                
                <div>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 bg-transparent"
                    onClick={handleDeleteAccount}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    {showDeleteConfirm ? "Click again to confirm deletion" : "Delete Account"}
                  </Button>
                  {showDeleteConfirm && (
                    <p className="text-sm text-destructive mt-2">
                      ⚠️ Warning: This action cannot be undone. Click again to confirm.
                    </p>
                  )}
                  {!showDeleteConfirm && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Permanently delete your account and all associated data.
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
