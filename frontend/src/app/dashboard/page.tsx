"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, TrendingUp, Users, Clock, ThermometerSun, Download, ExternalLink } from "lucide-react"
import { CurrentDensity } from "@/components/dashboard/current-density"
import { DensityTrends } from "@/components/dashboard/density-trends"
import { HeatMap } from "@/components/dashboard/heat-map"
import { AnomalyDetection } from "@/components/dashboard/anomaly-detection"
import { Predictions } from "@/components/dashboard/predictions"
import { SensorData } from "@/components/dashboard/sensor-data"
import { useLocationStore } from "@/lib/stores/location-store"
import { useSensorStore } from "@/lib/stores/sensor-store"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export default function Dashboard() {
  const { currentLocation } = useLocationStore()
  const { sensors, getSensorsByLocation } = useSensorStore()
  const [showAlert, setShowAlert] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [currentDensity, setCurrentDensity] = useState(65)
  const [densityTrend, setDensityTrend] = useState(12)
  const { toast } = useToast()

  // Get sensors for current location
  const locationSensors = getSensorsByLocation(currentLocation)
  const activeSensors = locationSensors.filter((sensor) => sensor.status === "online")

  // Simulate sensor alert after component mounts
  useEffect(() => {
    setMounted(true)

    // Simulate changing density values
    const densityInterval = setInterval(() => {
      const change = Math.floor(Math.random() * 7) - 3
      setCurrentDensity((prev) => {
        const newValue = Math.max(30, Math.min(95, prev + change))

        // High density alert
        if (newValue > 80 && prev <= 80) {
          setShowAlert(true)

          toast({
            title: "High Density Alert",
            description: `Crowd density at ${currentLocation} has exceeded 80%`,
            variant: "destructive",
          })

          // Auto-hide alert after 5 seconds
          setTimeout(() => {
            setShowAlert(false)
          }, 5000)
        }

        return newValue
      })

      // Update trend
      setDensityTrend(Math.floor(Math.random() * 20) - 5)
    }, 30000)

    return () => {
      clearInterval(densityInterval)
    }
  }, [currentLocation])

  const exportData = () => {
    toast({
      title: "Export Started",
      description: "Preparing your report for download...",
    })

    // Simulate export
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your report has been downloaded",
      })
    }, 2000)
  }

  if (!mounted) return null

  return (
    <div className="space-y-4 animate-fade-in">
      {showAlert && (
        <Alert variant="destructive" className="animate-pulse">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>High Crowd Density Alert</AlertTitle>
          <AlertDescription>
            🚨 Crowd density at {currentLocation} has exceeded 80%. Consider diverting traffic.
          </AlertDescription>
          <Button variant="destructive" size="sm" className="ml-auto" onClick={() => setShowAlert(false)}>
            Dismiss
          </Button>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={exportData}>
          <Download className="h-4 w-4 mr-1.5" /> Export Report
        </Button>
        <Button variant="outline" size="sm">
          <ExternalLink className="h-4 w-4 mr-1.5" /> Share Dashboard
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="hover-scale glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Density</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "text-2xl font-bold",
                  currentDensity < 40
                    ? "density-low"
                    : currentDensity < 70
                      ? "density-medium"
                      : currentDensity < 85
                        ? "density-high"
                        : "density-critical",
                )}
              >
                {currentDensity}%
              </div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={cn("inline-flex items-center", densityTrend > 0 ? "text-red-500" : "text-emerald-500")}
                >
                  <TrendingUp className={cn("mr-1 h-3 w-3", densityTrend < 0 && "rotate-180")} />
                  {densityTrend > 0 ? "+" : ""}
                  {densityTrend}%
                </span>{" "}
                from last hour
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="hover-scale glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sensors</CardTitle>
              <Badge variant={activeSensors.length > 0 ? "default" : "destructive"}>
                {activeSensors.length > 0 ? `${activeSensors.length} Online` : "Offline"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSensors.length}</div>
              <p className="text-xs text-muted-foreground">Monitoring sensors at {currentLocation}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="hover-scale glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peak Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5:30 PM</div>
              <p className="text-xs text-muted-foreground">Expected peak today</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="hover-scale glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temperature</CardTitle>
              <ThermometerSun className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32°C</div>
              <p className="text-xs text-muted-foreground">Current at location</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="col-span-4"
        >
          <Card className="col-span-4 hover-scale glass">
            <CardHeader>
              <CardTitle>Current Density</CardTitle>
              <CardDescription>Real-time crowd density at {currentLocation}</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <CurrentDensity location={currentLocation} density={currentDensity} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="col-span-3"
        >
          <Card className="col-span-3 hover-scale glass">
            <CardHeader>
              <CardTitle>Sensor Data</CardTitle>
              <CardDescription>Live readings from IoT sensors</CardDescription>
            </CardHeader>
            <CardContent>
              <SensorData location={currentLocation} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <Card className="col-span-1 hover-scale glass">
              <CardHeader>
                <CardTitle>Heat Map</CardTitle>
                <CardDescription>Spatial distribution of crowd density</CardDescription>
              </CardHeader>
              <CardContent>
                <HeatMap location={currentLocation} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <Card className="col-span-1 hover-scale glass">
              <CardHeader>
                <CardTitle>Density Trends</CardTitle>
                <CardDescription>Crowd density over the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <DensityTrends location={currentLocation} />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        <TabsContent value="anomalies" className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="hover-scale glass">
              <CardHeader>
                <CardTitle>Anomaly Detection</CardTitle>
                <CardDescription>Unusual crowd behavior patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <AnomalyDetection location={currentLocation} />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        <TabsContent value="predictions" className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="hover-scale glass">
              <CardHeader>
                <CardTitle>Crowd Predictions</CardTitle>
                <CardDescription>AI-powered crowd density forecasts</CardDescription>
              </CardHeader>
              <CardContent>
                <Predictions location={currentLocation} />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        <TabsContent value="alerts" className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="hover-scale glass">
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>Recent warnings and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Alert
                      key={i}
                      variant={i === 0 ? "destructive" : "default"}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <AlertTitle>
                          {i === 0 ? "High Density Alert" : i === 1 ? "Anomaly Detected" : "Prediction Alert"}
                        </AlertTitle>
                        <AlertDescription>
                          {i === 0
                            ? `Crowd density at ${currentLocation} exceeded 85%`
                            : i === 1
                              ? `Unusual dispersal pattern at ${currentLocation}`
                              : `High crowd expected at ${currentLocation} by 5 PM`}
                        </AlertDescription>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {i === 0 ? "5 mins ago" : i === 1 ? "30 mins ago" : "1 hour ago"}
                      </div>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

