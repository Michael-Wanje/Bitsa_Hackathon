import { api } from "@/lib/api"
import { notFound } from "next/navigation"

export default async function GalleryPhotoPage({ params }: { params: { id: string } }) {
  const photoId = params.id
  let photo
  try {
    const response = await api.gallery.getById(photoId)
    photo = response.data?.photo || response.photo
    if (!photo) return notFound()
  } catch {
    return notFound()
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">Photo Details</h1>
      <img
        src={photo.imageUrl}
        alt={photo.caption || "Gallery photo"}
        className="w-full h-auto rounded-lg mb-4"
      />
      <div className="mb-2">
        <span className="font-semibold">Event:</span> {photo.event?.title || "N/A"}
      </div>
      {photo.caption && <div className="mb-2"><span className="font-semibold">Caption:</span> {photo.caption}</div>}
      <div className="mt-6">
        <a href="/gallery" className="text-primary hover:underline">Back to Gallery</a>
      </div>
    </div>
  )
}
