"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Image, Video, Camera, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocationStore } from "@/lib/stores/location-store"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface QuickUploadProps {
  onClose: () => void
}

export function QuickUpload({ onClose }: QuickUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadType, setUploadType] = useState<"image" | "video" | "live">("image")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { currentLocation } = useLocationStore()
  const { toast } = useToast()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length) {
      handleFiles(files)
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files?.length) {
      handleFiles(files)
    }
  }

  const handleFiles = (files: FileList) => {
    setIsUploading(true)

    // In a real app, we would upload the file to the server
    // For now, we'll simulate the upload process

    // Create FormData
    const formData = new FormData()
    formData.append("file", files[0])
    formData.append("location", currentLocation)

    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setUploadProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)

        // Simulate processing time
        setTimeout(() => {
          setIsUploading(false)

          toast({
            title: "Upload Complete",
            description: `${uploadType === "image" ? "Image" : "Video"} analysis for ${currentLocation} is ready.`,
          })

          onClose()
        }, 1000)
      }
    }, 100)
  }

  const startLiveStream = () => {
    // In a real app, we would establish a WebRTC connection
    // For now, we'll simulate the connection process
    setIsUploading(true)
    setUploadProgress(0)

    // Simulate connection
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + 10
        if (newProgress >= 100) {
          clearInterval(interval)

          setTimeout(() => {
            setIsUploading(false)

            toast({
              title: "Live Feed Connected",
              description: `Live analysis for ${currentLocation} has started.`,
            })

            onClose()
          }, 500)
        }
        return newProgress
      })
    }, 100)
  }

  return (
    <motion.div
      className="border rounded-md overflow-hidden bg-background glass"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between border-b px-3 py-2">
        <h4 className="text-sm font-medium">Quick Upload</h4>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-3">
        <Tabs defaultValue="image" onValueChange={(value) => setUploadType(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="image" className="text-xs">
              <Image className="h-3.5 w-3.5 mr-1.5" />
              Image
            </TabsTrigger>
            <TabsTrigger value="video" className="text-xs">
              <Video className="h-3.5 w-3.5 mr-1.5" />
              Video
            </TabsTrigger>
            <TabsTrigger value="live" className="text-xs">
              <Camera className="h-3.5 w-3.5 mr-1.5" />
              Live
            </TabsTrigger>
          </TabsList>

          <div className="mt-3">
            <TabsContent value="image">
              <div
                className={cn(
                  "border border-dashed rounded-md p-4 text-center hover:bg-muted/50 transition-colors",
                  !isUploading && "cursor-pointer",
                )}
                onDragOver={!isUploading ? handleDragOver : undefined}
                onDrop={!isUploading ? handleDrop : undefined}
                onClick={!isUploading ? handleFileSelect : undefined}
              >
                <Image className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-xs font-medium">
                  {isUploading ? "Uploading..." : "Drag and drop an image, or click to browse"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WEBP up to 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </div>
            </TabsContent>

            <TabsContent value="video">
              <div
                className={cn(
                  "border border-dashed rounded-md p-4 text-center hover:bg-muted/50 transition-colors",
                  !isUploading && "cursor-pointer",
                )}
                onDragOver={!isUploading ? handleDragOver : undefined}
                onDrop={!isUploading ? handleDrop : undefined}
                onClick={!isUploading ? handleFileSelect : undefined}
              >
                <Video className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-xs font-medium">
                  {isUploading ? "Uploading..." : "Drag and drop a video, or click to browse"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">MP4, MOV, WEBM up to 100MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </div>
            </TabsContent>

            <TabsContent value="live">
              <div className="border border-dashed rounded-md p-4 text-center">
                <Camera className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-xs font-medium">
                  {isUploading ? "Connecting..." : "Connect to a live camera feed"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground mb-2">Requires camera permissions</p>
                <Button size="sm" onClick={startLiveStream} disabled={isUploading} className="mt-1">
                  <Camera className="h-3.5 w-3.5 mr-1.5" />
                  Start Live Feed
                </Button>
              </div>
            </TabsContent>
          </div>

          {isUploading && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>{uploadProgress < 100 ? "Uploading..." : "Processing..."}</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1.5" />
            </div>
          )}
        </Tabs>
      </div>
    </motion.div>
  )
}

