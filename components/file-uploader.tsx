"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Image, Video, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FileUploaderProps {
  onClose: () => void
}

export function FileUploader({ onClose }: FileUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadType, setUploadType] = useState<"image" | "video" | "live">("image")
  const fileInputRef = useRef<HTMLInputElement>(null)

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

    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setUploadProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        setIsUploading(false)
        // Here you would typically process the file and update your app state
        setTimeout(() => {
          onClose()
        }, 500)
      }
    }, 100)
  }

  const startLiveStream = () => {
    // Here you would typically start a live stream
    setIsUploading(true)
    setUploadProgress(100)

    // Simulate connection
    setTimeout(() => {
      setIsUploading(false)
      onClose()
    }, 1500)
  }

  return (
    <div className="w-full">
      <Tabs defaultValue="image" onValueChange={(value) => setUploadType(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="image">Image</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="live">Live Feed</TabsTrigger>
        </TabsList>

        <TabsContent value="image" className="mt-4">
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleFileSelect}
          >
            <Image className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">Drag and drop an image, or click to browse</p>
            <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WEBP up to 10MB</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        </TabsContent>

        <TabsContent value="video" className="mt-4">
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleFileSelect}
          >
            <Video className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">Drag and drop a video, or click to browse</p>
            <p className="mt-1 text-xs text-muted-foreground">MP4, MOV, WEBM up to 100MB</p>
            <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
          </div>
        </TabsContent>

        <TabsContent value="live" className="mt-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">Connect to a live camera feed</p>
            <p className="mt-1 text-xs text-muted-foreground">Requires camera permissions</p>
            <Button className="mt-4" onClick={startLiveStream} disabled={isUploading}>
              Start Live Feed
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {isUploading && (
        <div className="mt-4">
          <p className="text-sm mb-2">{uploadProgress < 100 ? "Uploading..." : "Processing..."}</p>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
    </div>
  )
}

