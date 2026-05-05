"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { Upload, Trash2, Star, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

interface ImagenPrenda {
  id: string
  url: string
  nombre: string | null
  esPrincipal: boolean
  orden: number
}

interface GaleriaImagenesProps {
  prendaId: string
  imagenes: ImagenPrenda[]
  onUpdate: () => void
}

export function GaleriaImagenes({ prendaId, imagenes, onUpdate }: GaleriaImagenesProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (imagenes.length >= 5) {
      toast.error("Máximo 5 imágenes por prenda")
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen")
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("esPrincipal", imagenes.length === 0 ? "true" : "false")

      const response = await fetch(`/api/prendas/calculadas/${prendaId}/imagenes`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Error al subir imagen")

      toast.success("Imagen subida correctamente")
      onUpdate()
    } catch (error) {
      toast.error("Error al subir la imagen")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDelete = async (imagenId: string) => {
    if (!confirm("¿Eliminar esta imagen?")) return

    try {
      const response = await fetch(
        `/api/prendas/calculadas/${prendaId}/imagenes/${imagenId}`,
        { method: "DELETE" }
      )

      if (!response.ok) throw new Error("Error al eliminar")

      toast.success("Imagen eliminada")
      onUpdate()
    } catch (error) {
      toast.error("Error al eliminar la imagen")
    }
  }

  const handleSetPrincipal = async (imagenId: string) => {
    try {
      const response = await fetch(
        `/api/prendas/calculadas/${prendaId}/imagenes/${imagenId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ esPrincipal: true }),
        }
      )

      if (!response.ok) throw new Error("Error al actualizar")

      toast.success("Imagen principal actualizada")
      onUpdate()
    } catch (error) {
      toast.error("Error al actualizar la imagen")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Galería de Imágenes</h3>
        <div className="text-sm text-muted-foreground">
          {imagenes.length} / 5 imágenes
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {imagenes.map((imagen) => (
          <Card key={imagen.id} className="relative group overflow-hidden">
            <div className="aspect-square relative">
              <Image
                src={imagen.url}
                alt={imagen.nombre || "Imagen de prenda"}
                fill
                className="object-cover"
              />
              {imagen.esPrincipal && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white p-1 rounded-full">
                  <Star className="h-4 w-4 fill-current" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!imagen.esPrincipal && (
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => handleSetPrincipal(imagen.id)}
                    title="Marcar como principal"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => handleDelete(imagen.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {imagenes.length < 5 && (
          <Card className="aspect-square border-dashed border-2 hover:border-primary transition-colors cursor-pointer">
            <label className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto animate-pulse text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Subiendo...</p>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Agregar imagen</p>
                </div>
              )}
            </label>
          </Card>
        )}
      </div>

      {imagenes.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No hay imágenes. Agrega hasta 5 imágenes de esta prenda.
        </p>
      )}
    </div>
  )
}
