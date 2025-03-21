"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Maximize2, Download, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface HeatMapProps {
  location: string
  detailed?: boolean
}

// Generate heat map data based on location
const generateHeatMapData = (location: string) => {
  // Use location to seed the random generator for consistent results
  let seed = location.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const rng = () => {
    const x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
  }

  // Generate between 5-15 points
  const pointCount = Math.floor(rng() * 10) + 5
  const points = []

  for (let i = 0; i < pointCount; i++) {
    points.push({
      x: Math.floor(rng() * 500) + 50,
      y: Math.floor(rng() * 300) + 50,
      value: rng() * 0.7 + 0.3, // 0.3 to 1.0
    })
  }

  return points
}

export function HeatMap({ location, detailed = false }: HeatMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fullscreenCanvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const renderHeatMap = (canvas: HTMLCanvasElement | null, points: any[], fullscreen = false) => {
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw map background
    ctx.fillStyle = "#f3f4f6"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw roads (simplified)
    ctx.strokeStyle = "#9ca3af"
    ctx.lineWidth = fullscreen ? 3 : 2

    // Horizontal roads
    for (let i = 1; i <= 3; i++) {
      const y = canvas.height * (i / 4)
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Vertical roads
    for (let i = 1; i <= 4; i++) {
      const x = canvas.width * (i / 5)
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    // Add location name
    ctx.font = fullscreen ? "18px Arial" : "14px Arial"
    ctx.fillStyle = "#1f2937"
    ctx.textAlign = "center"
    ctx.fillText(location, canvas.width / 2, 20)

    // Draw heat map
    for (const point of points) {
      const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, fullscreen ? 80 : 50)

      // Color based on density
      const color =
        point.value < 0.5
          ? `rgba(16, 185, 129, ${point.value})`
          : // Green
            point.value < 0.8
            ? `rgba(245, 158, 11, ${point.value})`
            : // Yellow
              `rgba(239, 68, 68, ${point.value})` // Red

      gradient.addColorStop(0, color)
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(point.x, point.y, fullscreen ? 80 : 50, 0, Math.PI * 2)
      ctx.fill()
    }

    // Add legend if detailed or fullscreen
    if (detailed || fullscreen) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
      ctx.fillRect(10, 10, 120, 100)
      ctx.strokeStyle = "#e5e7eb"
      ctx.strokeRect(10, 10, 120, 100)

      ctx.font = fullscreen ? "14px Arial" : "12px Arial"
      ctx.fillStyle = "#1f2937"
      ctx.textAlign = "left"
      ctx.fillText("Density Legend:", 20, 30)

      const legendColors = [
        { color: "rgba(239, 68, 68, 0.8)", label: "High" },
        { color: "rgba(245, 158, 11, 0.8)", label: "Medium" },
        { color: "rgba(16, 185, 129, 0.8)", label: "Low" },
      ]

      legendColors.forEach((item, index) => {
        const y = 50 + index * 20
        ctx.fillStyle = item.color
        ctx.fillRect(20, y, 15, 15)
        ctx.fillStyle = "#1f2937"
        ctx.fillText(item.label, 45, y + 12)
      })
    }
  }

  const downloadHeatMap = () => {
    if (!fullscreenCanvasRef.current) return

    const link = document.createElement("a")
    link.download = `heatmap-${location.toLowerCase().replace(/\s+/g, "-")}.png`
    link.href = fullscreenCanvasRef.current.toDataURL()
    link.click()

    toast({
      title: "Download Complete",
      description: `Heatmap for ${location} has been downloaded`,
    })
  }

  useEffect(() => {
    setLoading(true)

    // Generate points based on location
    const points = generateHeatMapData(location)

    // Render on the regular canvas
    setTimeout(() => {
      renderHeatMap(canvasRef.current, points)
      setLoading(false)
    }, 500)

    // Render on the fullscreen canvas when dialog opens
    if (isDialogOpen) {
      renderHeatMap(fullscreenCanvasRef.current, points, true)
    }
  }, [location, isDialogOpen])

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 rounded-md">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-sm text-muted-foreground">Loading map...</div>
          </div>
        </div>
      )}

      <div className="relative rounded-md overflow-hidden">
        <canvas ref={canvasRef} width={600} height={400} className="w-full h-auto" />

        <div className="absolute top-2 right-2 flex gap-1">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="icon" className="h-7 w-7 opacity-80">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[800px] w-full">
              <DialogHeader>
                <DialogTitle>Heat Map: {location}</DialogTitle>
              </DialogHeader>
              <div className="relative mt-4 rounded-md overflow-hidden">
                <canvas ref={fullscreenCanvasRef} width={800} height={600} className="w-full h-auto" />
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={downloadHeatMap}>
                  <Download className="h-4 w-4 mr-1.5" />
                  Download
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="secondary" size="icon" className="h-7 w-7 opacity-80" onClick={downloadHeatMap}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

