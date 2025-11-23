"use client"

import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Plus, Trash2, Upload, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Image from "next/image"

interface GalleryPhoto {
  id: string
  imageUrl: string
  caption: string
  eventId?: string
  uploadedAt: string
  event?: {
    id: string
    title: string
  }
}

export default function AdminGalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("url")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [caption, setCaption] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    try {
      setLoading(true)
      const response = await api.gallery.getAll({ limit: 50 })
      if (response.success) {
        setPhotos(response.data?.photos || [])
      }
    } catch (error) {
      console.error("Failed to fetch photos:", error)
      toast({
        title: "Error",
        description: "Failed to fetch photos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    
    if (!file) {
      return
    }
    
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      })
      e.target.value = ""
      return
    }
    
    // Check file size (10MB limit - base64 encoding will increase this by ~33%, so max ~13MB encoded)
    const maxSizeInMB = 10
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    
    if (file.size > maxSizeInBytes) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
      toast({
        title: "File Too Large",
        description: `Image size exceeds ${maxSizeInMB}MB. Please select a smaller image or compress it (current size: ${fileSizeMB}MB)`,
        variant: "destructive",
      })
      e.target.value = ""
      setSelectedFile(null)
      setPreviewUrl(null)
      return
    }
    
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "bitsa_gallery") // You'll need to create this in Cloudinary
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload`, // Replace with your cloud name
      {
        method: "POST",
        body: formData,
      }
    )
    
    if (!response.ok) {
      throw new Error("Failed to upload image to cloud storage")
    }
    
    const data = await response.json()
    return data.secure_url
  }

  const handleUpload = async () => {
    if (uploadMethod === "url" && !imageUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter an image URL",
        variant: "destructive",
      })
      return
    }

    if (uploadMethod === "file" && !selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      let finalImageUrl = imageUrl

      // If uploading from file, convert to base64
      if (uploadMethod === "file" && selectedFile) {
        const reader = new FileReader()
        finalImageUrl = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(selectedFile)
        })

        // Check base64 size (base64 is ~33% larger than original)
        const base64Size = finalImageUrl.length * 0.75 // Approximate bytes
        const maxSizeInBytes = 50 * 1024 * 1024 // 50MB
        if (base64Size > maxSizeInBytes) {
          toast({
            title: "Image Too Large",
            description: `The encoded image is too large (${(base64Size / 1024 / 1024).toFixed(2)}MB). Please compress or resize the image.`,
            variant: "destructive",
          })
          setUploading(false)
          return
        }
      }

      // Send as JSON instead of FormData
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/gallery`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          imageUrl: finalImageUrl,
          caption: caption || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Photo uploaded successfully",
        })
        setUploadDialogOpen(false)
        setImageUrl("")
        setCaption("")
        setSelectedFile(null)
        setPreviewUrl(null)
        setUploadMethod("url")
        // Fetch photos to refresh the list
        await fetchPhotos()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to upload photo",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to upload photo:", error)
      toast({
        title: "Error",
        description: "Failed to upload photo",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return

    try {
      const response = await api.gallery.delete(id)
      if (response.success) {
        toast({
          title: "Success",
          description: "Photo deleted successfully",
        })
        fetchPhotos()
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete photo",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to delete photo:", error)
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive",
      })
    }
  }

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
              <h1 className="text-4xl font-bold text-foreground">Manage Gallery</h1>
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 gap-2">
                    <Plus className="w-4 h-4" />
                    Upload Photo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Photo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {/* Upload Method Toggle */}
                    <div className="flex gap-2 p-1 bg-muted rounded-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setUploadMethod("url")
                          setSelectedFile(null)
                          setPreviewUrl(null)
                        }}
                        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          uploadMethod === "url"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Image URL
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadMethod("file")
                          setImageUrl("")
                        }}
                        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          uploadMethod === "file"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Upload File
                      </button>
                    </div>

                    {/* URL Upload Method */}
                    {uploadMethod === "url" && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Image URL *
                        </label>
                        <Input
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                        />
                      </div>
                    )}

                    {/* File Upload Method */}
                    {uploadMethod === "file" && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Select Image *
                        </label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                        >
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-foreground font-medium mb-1">
                            {selectedFile ? selectedFile.name : "Click to browse"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Caption */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Caption (optional)
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter photo caption..."
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                      />
                    </div>

                    {/* Preview */}
                    {((uploadMethod === "url" && imageUrl) || (uploadMethod === "file" && previewUrl)) && (
                      <div className="border rounded-md p-2">
                        <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                        <div className="relative aspect-video bg-muted rounded overflow-hidden">
                          <Image
                            src={uploadMethod === "url" ? imageUrl : previewUrl!}
                            alt="Preview"
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Upload Button */}
                    <Button
                      onClick={handleUpload}
                      disabled={uploading || (uploadMethod === "url" ? !imageUrl.trim() : !selectedFile)}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Photo
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>

        {/* Upload Area */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto mb-8">
            <Card 
              className="p-12 border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer"
              onClick={() => setUploadDialogOpen(true)}
            >
              <div className="text-center">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Upload Photos</h3>
                <p className="text-muted-foreground mb-4">Click here to upload a photo by URL or from your device</p>
                <Button variant="outline" onClick={(e) => {
                  e.stopPropagation()
                  setUploadDialogOpen(true)
                }}>
                  Choose Photo
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* Photos Grid */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">Recent Photos</h2>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading photos...</div>
            ) : photos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No photos uploaded yet. Upload your first photo to get started!
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map((photo) => (
                  <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-muted relative">
                      <Image
                        src={photo.imageUrl}
                        alt={photo.caption || "Gallery photo"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-foreground mb-2">{photo.caption || "Untitled"}</h3>
                      {photo.event && (
                        <p className="text-sm text-muted-foreground mb-2">Event: {photo.event.title}</p>
                      )}
                      <p className="text-xs text-muted-foreground mb-4">
                        Uploaded: {new Date(photo.uploadedAt).toLocaleDateString()}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full gap-2 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(photo.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <Toaster />
    </>
  )
}
