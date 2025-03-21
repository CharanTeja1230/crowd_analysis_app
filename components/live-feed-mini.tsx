"use client"

import { useRef, useState, useEffect } from "react"
import { Camera, X, Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLocationStore } from "@/lib/stores/location-store"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface LiveFeedMiniProps {
  onClose: () => void
}

export function LiveFeedMini({ onClose }: LiveFeedMiniProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentDensity, setCurrentDensity] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const { currentLocation } = useLocationStore()
  const { toast } = useToast()

  const startStream = async () => {
    try {
      if (!videoRef.current) return

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      videoRef.current.srcObject = stream
      videoRef.current.play()
      setIsStreaming(true)
      setIsPaused(false)
      setError(null)

      // Start analyzing frames
      analyzeFrames()

      toast({
        title: "Live Feed Started",
        description: `Monitoring ${currentLocation} in real-time`,
      })
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("Could not access camera. Please check permissions.")
    }
  }

  const stopStream = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return

    const stream = videoRef.current.srcObject as MediaStream
    const tracks = stream.getTracks()

    tracks.forEach((track) => track.stop())
    videoRef.current.srcObject = null
    setIsStreaming(false)
    setIsPaused(false)
  }

  const togglePause = () => {
    if (!videoRef.current) return

    if (isPaused) {
      videoRef.current.play()
    } else {
      videoRef.current.pause()
    }

    setIsPaused(!isPaused)
  }

  const analyzeFrames = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    const processFrame = () => {
      if (!isStreaming || !video.videoWidth) return

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // In a real application, you would use TensorFlow.js here to detect people
      // and calculate crowd density

      // For demo purposes, we'll simulate crowd density calculation
      const newDensity = Math.floor(Math.random() * 30) + 50 // 50-80%
      setCurrentDensity(newDensity)

      // Draw bounding boxes (simulated)
      drawSimulatedBoundingBoxes(ctx, canvas.width, canvas.height)

      // Process next frame
      if (!isPaused) {
        requestAnimationFrame(processFrame)
      }
    }

    // Start processing frames
    processFrame()
  }

  const drawSimulatedBoundingBoxes = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Simulate 5-10 people in the frame
    const peopleCount = Math.floor(Math.random() * 5) + 5

    ctx.strokeStyle = "rgba(0, 255, 0, 0.7)"
    ctx.lineWidth = 2

    for (let i = 0; i < peopleCount; i++) {
      const x = Math.random() * (width - 50)
      const y = Math.random() * (height - 100)
      const w = Math.random() * 20 + 20
      const h = Math.random() * 40 + 50

      ctx.strokeRect(x, y, w, h)
    }

    // Add density indicator
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.fillRect(10, 10, 100, 30)
    ctx.fillStyle = "white"
    ctx.font = "12px Arial"
    ctx.fillText(`Density: ${currentDensity}%`, 15, 28)
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isStreaming) {
        stopStream()
      }
    }
  }, [isStreaming])

  useEffect(() => {
    if (!isStreaming) {
      startStream()
    }
  }, [])

  return (
    <div className="bg-background border rounded-md overflow-hidden animate-slide-up">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <h4 className="text-sm font-medium flex items-center gap-1.5">
          <Camera className="h-3.5 w-3.5" />
          Live Feed: {currentLocation}
        </h4>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-3">
        <div className="relative rounded-md overflow-hidden bg-muted">
          <div className="aspect-video relative w-full max-w-md">
            <video
              ref={videoRef}
              className={cn("absolute inset-0 h-full w-full object-cover", error && "hidden")}
              muted
              playsInline
            />
            <canvas ref={canvasRef} className={cn("absolute inset-0 h-full w-full", error && "hidden")} />

            {error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-sm text-muted-foreground text-center">
                  <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>{error}</p>
                  <Button size="sm" onClick={startStream} className="mt-2">
                    Retry
                  </Button>
                </div>
              </div>
            )}

            <div className="absolute bottom-2 right-2 flex gap-1">
              {isStreaming && (
                <Button size="sm" variant="secondary" className="h-7 opacity-90" onClick={togglePause}>
                  {isPaused ? (
                    <>
                      <Play className="h-3.5 w-3.5 mr-1" /> Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-3.5 w-3.5 mr-1" /> Pause
                    </>
                  )}
                </Button>
              )}
              <Button
                size="sm"
                variant={isStreaming ? "destructive" : "default"}
                className="h-7 opacity-90"
                onClick={isStreaming ? stopStream : startStream}
              >
                {isStreaming ? "Stop" : "Start"}
              </Button>
            </div>
          </div>
        </div>

        {isStreaming && (
          <div className="mt-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <span className="font-medium">Current Density:</span>
              <span
                className={cn(
                  "font-bold",
                  currentDensity < 40 ? "density-low" : currentDensity < 70 ? "density-medium" : "density-high",
                )}
              >
                {currentDensity}%
              </span>
            </div>
            <a href="/dashboard/live" className="text-xs text-primary hover:underline">
              Full Analysis
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

