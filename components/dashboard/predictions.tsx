"use client"

import { useState, useEffect } from "react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, ReferenceLine, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PredictionInsight {
  id: number
  location: string
  time: string
  prediction: string
  confidence: "high" | "medium" | "low"
}

interface PredictionsProps {
  location: string
}

// Generate prediction data based on location
const generatePredictionData = (location: string) => {
  // Use location to seed the random generator
  const seed = location.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const rng = () => {
    const x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
  }

  const now = new Date()
  const currentHour = now.getHours()
  const currentMinutes = now.getMinutes()
  const currentTimeString = `${currentHour}:${currentMinutes < 10 ? "0" + currentMinutes : currentMinutes}`

  // Generate hourly prediction data (next 6 hours)
  const hourlyData = []

  // Add actual data for the past 2 hours
  for (let i = 2; i >= 0; i--) {
    const hour = (currentHour - i + 24) % 24
    const timeString = `${hour}:00`

    // Base value with some randomness
    const baseValue = 50 + Math.sin((hour / 6) * Math.PI) * 20
    const randomFactor = rng() * 10 - 5
    const value = Math.round(Math.max(0, Math.min(100, baseValue + randomFactor)))

    hourlyData.push({
      time: timeString,
      actual: value,
      predicted: null,
    })
  }

  // Add predictions for the next 6 hours
  for (let i = 1; i <= 6; i++) {
    const hour = (currentHour + i) % 24
    const timeString = `${hour}:00`

    // Base prediction with some randomness
    const baseValue = 50 + Math.sin((hour / 6) * Math.PI) * 25
    const randomFactor = rng() * 8 - 4
    const value = Math.round(Math.max(0, Math.min(100, baseValue + randomFactor)))

    hourlyData.push({
      time: timeString,
      actual: null,
      predicted: value,
    })
  }

  return hourlyData
}

// Generate daily prediction data
const generateDailyPredictionData = (location: string) => {
  const seed = location.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const rng = () => {
    const x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
  }

  const now = new Date()
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const currentDay = now.getDay()

  const dailyData = []

  // Add actual data for the past 3 days
  for (let i = 3; i >= 0; i--) {
    const dayIndex = (currentDay - i + 7) % 7
    const day = weekdays[dayIndex]

    // Base value with some randomness
    const isWeekend = dayIndex === 0 || dayIndex === 6
    const baseValue = isWeekend ? 60 : 75
    const randomFactor = rng() * 15 - 7.5
    const value = Math.round(Math.max(0, Math.min(100, baseValue + randomFactor)))

    dailyData.push({
      day,
      actual: value,
      predicted: null,
    })
  }

  // Add predictions for the next 4 days
  for (let i = 1; i <= 4; i++) {
    const dayIndex = (currentDay + i) % 7
    const day = weekdays[dayIndex]

    // Base prediction with some randomness
    const isWeekend = dayIndex === 0 || dayIndex === 6
    const baseValue = isWeekend ? 60 : 75
    const randomFactor = rng() * 12 - 6
    const value = Math.round(Math.max(0, Math.min(100, baseValue + randomFactor)))

    dailyData.push({
      day,
      actual: null,
      predicted: value,
    })
  }

  return dailyData
}

// Generate prediction insights
const generatePredictionInsights = (location: string): PredictionInsight[] => {
  const seed = location.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const rng = () => {
    const x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
  }

  const now = new Date()
  const hours = [17, 18, 19]
  const predictions = [
    `Peak crowd density expected at ${location}`,
    `Gradual increase in crowd density at ${location}`,
    `Crowd dispersal expected at ${location}`,
  ]
  const confidences: ("high" | "medium" | "low")[] = ["high", "medium", "high"]

  return hours.map((hour, index) => ({
    id: index + 1,
    location,
    time: `${hour}:${Math.floor(rng() * 6)}0`,
    prediction: predictions[index],
    confidence: confidences[index],
  }))
}

export function Predictions({ location }: PredictionsProps) {
  const [hourlyData, setHourlyData] = useState(() => generatePredictionData(location))
  const [dailyData, setDailyData] = useState(() => generateDailyPredictionData(location))
  const [insights, setInsights] = useState<PredictionInsight[]>(() => generatePredictionInsights(location))
  const [timeframe, setTimeframe] = useState("hourly")

  // Update data when location changes
  useEffect(() => {
    setHourlyData(generatePredictionData(location))
    setDailyData(generateDailyPredictionData(location))
    setInsights(generatePredictionInsights(location))
  }, [location])

  const currentTime = new Date()
  const hours = currentTime.getHours()
  const minutes = currentTime.getMinutes()
  const currentTimeString = `${hours}:${minutes < 10 ? "0" + minutes : minutes}`
  const today = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][currentTime.getDay()]

  return (
    <div className="space-y-6">
      <div>
        <Tabs defaultValue="hourly" value={timeframe} onValueChange={setTimeframe} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hourly">Hourly</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
          </TabsList>

          <TabsContent value="hourly" className="pt-4">
            <ChartContainer
              config={{
                actual: {
                  label: "Actual",
                  color: "hsl(var(--chart-1))",
                },
                predicted: {
                  label: "Predicted",
                  color: "hsl(var(--chart-2))",
                  strokeDasharray: "5 5",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                  <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <ReferenceLine
                    x={`${hours}:00`}
                    stroke="hsl(var(--foreground))"
                    strokeDasharray="3 3"
                    label={{ value: "Now", position: "top", fill: "hsl(var(--foreground))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="daily" className="pt-4">
            <ChartContainer
              config={{
                actual: {
                  label: "Actual",
                  color: "hsl(var(--chart-1))",
                },
                predicted: {
                  label: "Predicted",
                  color: "hsl(var(--chart-2))",
                  strokeDasharray: "5 5",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <ReferenceLine
                    x={today}
                    stroke="hsl(var(--foreground))"
                    strokeDasharray="3 3"
                    label={{ value: "Today", position: "top", fill: "hsl(var(--foreground))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">AI Predictions</h3>
        <div className="space-y-3">
          {insights.map((insight) => (
            <Card key={insight.id} className="hover-scale">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    <TrendingUp className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <h4 className="font-medium">{insight.prediction}</h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3.5 w-3.5" />
                        {insight.time} today
                      </div>
                    </div>
                  </div>
                  <Badge variant={insight.confidence === "high" ? "default" : "outline"}>
                    {insight.confidence === "high" ? "High Confidence" : "Medium Confidence"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <Button size="sm" variant="outline">
            <Calendar className="mr-1.5 h-4 w-4" />
            View Weekly Forecast
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

