"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Thermometer, Users, Wind, Droplets, Wifi, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface SensorData {
  id: number
  name: string
  value: number
  unit: string
  icon: React.ElementType
  color: string
  progressColor: string
  previousValue?: number
}

interface SensorDataProps {
  location: string
  status?: "connected" | "disconnected"
}

// Generate sensor data based on location
const generateSensorData = (location: string): SensorData[] => {
  // Use location to seed the random generator
  let seed = location.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const rng = () => {
    const x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
  }

  return [
    {
      id: 1,
      name: "Crowd Density",
      value: Math.round(rng() * 30 + 50), // 50-80
      unit: "%",
      icon: Users,
      color: "text-amber-500",
      progressColor: "bg-amber-500",
    },
    {
      id: 2,
      name: "Temperature",
      value: Math.round(rng() * 10 + 25), // 25-35
      unit: "°C",
      icon: Thermometer,
      color: "text-red-500",
      progressColor: "bg-red-500",
    },
    {
      id: 3,
      name: "Humidity",
      value: Math.round(rng() * 30 + 50), // 50-80
      unit: "%",
      icon: Droplets,
      color: "text-blue-500",
      progressColor: "bg-blue-500",
    },
    {
      id: 4,
      name: "Air Quality",
      value: Math.round(rng() * 50 + 30), // 30-80
      unit: "AQI",
      icon: Wind,
      color: "text-emerald-500",
      progressColor: "bg-emerald-500",
    },
  ]
}

export function SensorData({ location, status = "connected" }: SensorDataProps) {
  const [sensorData, setSensorData] = useState<SensorData[]>(generateSensorData(location))
  const [sensorTab, setSensorTab] = useState("all")
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const { toast } = useToast()

  // Update data when location changes
  useEffect(() => {
    const newData = generateSensorData(location)
    setSensorData(newData)
    setLastUpdated(new Date())
  }, [location])

  // Simulate sensor data updates
  useEffect(() => {
    if (status === "disconnected") return

    const interval = setInterval(() => {
      setSensorData((prevData) => {
        const newData = prevData.map((sensor) => {
          const previousValue = sensor.value
          const change = Math.random() * 6 - 3
          const newValue = Math.max(0, Math.min(100, sensor.value + change))

          // Alert on significant increases in crowd density
          if (sensor.name === "Crowd Density" && previousValue < 80 && newValue >= 80) {
            toast({
              title: "High Density Alert",
              description: `Crowd density at ${location} has exceeded 80%`,
              variant: "destructive",
            })
          }

          return {
            ...sensor,
            previousValue,
            value: Math.round(newValue),
          }
        })

        setLastUpdated(new Date())
        return newData
      })
    }, 15000) // Update every 15 seconds

    return () => clearInterval(interval)
  }, [location, status, toast])

  // Get single sensor data
  const getSensorById = (id: number) => {
    return sensorData.find((sensor) => sensor.id === id)
  }

  return (
    <div className="space-y-4">
      <Tabs value={sensorTab} onValueChange={setSensorTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="text-xs">
            All
          </TabsTrigger>
          <TabsTrigger value="crowd" className="text-xs">
            Crowd
          </TabsTrigger>
          <TabsTrigger value="temp" className="text-xs">
            Temp
          </TabsTrigger>
          <TabsTrigger value="humidity" className="text-xs">
            Humidity
          </TabsTrigger>
          <TabsTrigger value="air" className="text-xs">
            Air
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="pt-2 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Wifi className={`h-4 w-4 mr-1 ${status === "connected" ? "text-emerald-500" : "text-red-500"}`} />
              <span className="text-xs capitalize">{status}</span>
            </div>
            <span className="text-xs text-muted-foreground">Updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>

          <div className="space-y-2">
            {sensorData.map((sensor) => (
              <Card key={sensor.id} className="hover-scale">
                <CardContent className="p-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <sensor.icon className={`h-3.5 w-3.5 mr-1.5 ${sensor.color}`} />
                      <span className="text-xs font-medium">{sensor.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium">
                        {Math.round(sensor.value)}
                        {sensor.unit}
                      </span>
                      {sensor.previousValue !== undefined && (
                        <span
                          className={cn(
                            "text-[10px]",
                            sensor.value > sensor.previousValue ? "text-red-500" : "text-emerald-500",
                          )}
                        >
                          {sensor.value > sensor.previousValue ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </div>
                  <Progress
                    value={sensor.value}
                    max={100}
                    className="h-1.5"
                    indicatorClassName={sensor.progressColor}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="crowd" className="pt-4 space-y-2">
          <DetailedSensorView sensor={getSensorById(1)} location={location} />
        </TabsContent>

        <TabsContent value="temp" className="pt-4 space-y-2">
          <DetailedSensorView sensor={getSensorById(2)} location={location} />
        </TabsContent>

        <TabsContent value="humidity" className="pt-4 space-y-2">
          <DetailedSensorView sensor={getSensorById(3)} location={location} />
        </TabsContent>

        <TabsContent value="air" className="pt-4 space-y-2">
          <DetailedSensorView sensor={getSensorById(4)} location={location} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DetailedSensorView({ sensor, location }: { sensor?: SensorData; location: string }) {
  if (!sensor) return null

  // Determine status based on sensor type and value
  let status = "Normal"
  let statusColor = "text-emerald-500"
  let warningMessage = null

  if (sensor.name === "Crowd Density") {
    if (sensor.value > 80) {
      status = "Critical"
      statusColor = "text-red-500"
      warningMessage = `Crowd density at ${location} is at critical levels`
    } else if (sensor.value > 60) {
      status = "Warning"
      statusColor = "text-amber-500"
      warningMessage = `Crowd density at ${location} is approaching critical levels`
    }
  } else if (sensor.name === "Temperature") {
    if (sensor.value > 33) {
      status = "Hot"
      statusColor = "text-red-500"
      warningMessage = `Temperature at ${location} is high`
    } else if (sensor.value < 28) {
      status = "Cool"
      statusColor = "text-blue-500"
    }
  } else if (sensor.name === "Air Quality") {
    if (sensor.value > 70) {
      status = "Poor"
      statusColor = "text-red-500"
      warningMessage = `Air quality at ${location} is poor`
    } else if (sensor.value > 50) {
      status = "Moderate"
      statusColor = "text-amber-500"
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <sensor.icon className={`h-5 w-5 mr-2 ${sensor.color}`} />
              <div>
                <h3 className="font-medium">{sensor.name}</h3>
                <p className="text-xs text-muted-foreground">Sensor at {location}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">
                {sensor.value}
                {sensor.unit}
              </div>
              <p className={`text-xs ${statusColor}`}>{status}</p>
            </div>
          </div>

          <Progress value={sensor.value} max={100} className="h-2 mt-3" indicatorClassName={sensor.progressColor} />

          {warningMessage && (
            <div className="flex items-center gap-1.5 mt-3 text-sm text-amber-500">
              <AlertCircle className="h-4 w-4" />
              <span>{warningMessage}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <h4 className="text-sm font-medium mb-2">Sensor Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID:</span>
              <span>SEN-{sensor.id.toString().padStart(4, "0")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span>{sensor.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Calibrated:</span>
              <span>Today</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Battery:</span>
              <span>98%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

