"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, ArrowRight, Info, TrendingDown, TrendingUp } from "lucide-react"

// Anomaly type
interface Anomaly {
  id: number
  location: string
  type: string
  time: string
  timestamp: Date
  description: string
  severity: "high" | "medium" | "low"
}

interface AnomalyDetectionProps {
  location: string
}

// Generate anomalies based on location
const generateAnomalies = (location: string): Anomaly[] => {
  // Use location to seed the random generator
  const seed = location.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const rng = () => {
    const x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
  }

  const anomalyTypes = [
    "Sudden Surge",
    "Unusual Dispersal",
    "Abnormal Pattern",
    "Density Fluctuation",
    "Movement Anomaly",
    "Rapid Influx",
  ]

  const descriptions = [
    `Unexpected increase in crowd density at ${location}`,
    `Rapid crowd dispersal detected at ${location}`,
    `Crowd movement pattern deviates from historical data at ${location}`,
    `Unusual fluctuations in crowd density at ${location}`,
    `Unexpected movement pattern detected at ${location}`,
    `Sudden influx of people at ${location}`,
  ]

  const severities: ("high" | "medium" | "low")[] = ["high", "medium", "low"]

  // Generate 3-7 anomalies
  const count = Math.floor(rng() * 4) + 3
  const now = new Date()

  const anomalies: Anomaly[] = []
  for (let i = 0; i < count; i++) {
    const typeIndex = Math.floor(rng() * anomalyTypes.length)
    const severityIndex = Math.floor(rng() * severities.length)
    const minutesAgo = Math.floor(rng() * 120) // Up to 2 hours ago
    const timestamp = new Date(now.getTime() - minutesAgo * 60000)

    anomalies.push({
      id: i + 1,
      location,
      type: anomalyTypes[typeIndex],
      description: descriptions[typeIndex],
      severity: severities[severityIndex],
      timestamp,
      time:
        minutesAgo <= 0
          ? "Just now"
          : minutesAgo === 1
            ? "1 minute ago"
            : minutesAgo < 60
              ? `${minutesAgo} minutes ago`
              : minutesAgo === 60
                ? "1 hour ago"
                : `${Math.floor(minutesAgo / 60)} hours ago`,
    })
  }

  // Sort by timestamp (most recent first)
  return anomalies.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export function AnomalyDetection({ location }: AnomalyDetectionProps) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>(() => generateAnomalies(location))
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  // Update anomalies when location changes
  useEffect(() => {
    setAnomalies(generateAnomalies(location))
    setExpandedId(null)
  }, [location])

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500 hover:bg-red-600"
      case "medium":
        return "bg-amber-500 hover:bg-amber-600"
      case "low":
        return "bg-emerald-500 hover:bg-emerald-600"
      default:
        return "bg-slate-500 hover:bg-slate-600"
    }
  }

  const getAnomalyIcon = (type: string) => {
    if (type.includes("Surge") || type.includes("Influx")) {
      return <TrendingUp className="h-5 w-5 text-red-500" />
    } else if (type.includes("Dispersal")) {
      return <TrendingDown className="h-5 w-5 text-amber-500" />
    } else {
      return <AlertTriangle className="h-5 w-5 text-amber-500" />
    }
  }

  // Filter anomalies by severity
  const filteredAnomalies = activeTab === "all" ? anomalies : anomalies.filter((a) => a.severity === activeTab)

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="high">High</TabsTrigger>
          <TabsTrigger value="medium">Medium</TabsTrigger>
          <TabsTrigger value="low">Low</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredAnomalies.length > 0 ? (
        <div className="space-y-3">
          {filteredAnomalies.map((anomaly) => (
            <Card
              key={anomaly.id}
              className="cursor-pointer transition-all hover:shadow-md hover-scale"
              onClick={() => toggleExpand(anomaly.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getAnomalyIcon(anomaly.type)}
                    <div>
                      <h3 className="font-medium">{anomaly.type}</h3>
                      <p className="text-sm text-muted-foreground">{anomaly.time}</p>
                    </div>
                  </div>
                  <Badge className={`${getSeverityColor(anomaly.severity)} text-white`}>
                    {anomaly.severity.charAt(0).toUpperCase() + anomaly.severity.slice(1)}
                  </Badge>
                </div>

                {expandedId === anomaly.id && (
                  <div className="mt-4 border-t pt-4 animate-fade-in">
                    <p className="text-sm">{anomaly.description}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Info className="mr-1.5 h-4 w-4" />
                        Detected at {anomaly.timestamp.toLocaleTimeString()}
                      </div>
                      <Button size="sm" variant="outline" className="text-xs h-8">
                        View Details <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
          <Info className="h-8 w-8 mb-2 opacity-50" />
          <p>No {activeTab !== "all" ? activeTab : ""} anomalies detected</p>
        </div>
      )}
    </div>
  )
}

