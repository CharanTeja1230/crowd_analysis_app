"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, ReferenceLine } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DensityTrendsProps {
  location: string
}

// Generate data based on location
const generateDailyData = (location: string) => {
  // Use location to seed the random generator for consistent results
  const seed = location.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)

  // Generate data for the past 24 hours
  const data = []
  const now = new Date()
  const currentHour = now.getHours()

  for (let i = 0; i < 24; i++) {
    const hour = (currentHour - 23 + i + 24) % 24
    const hourString = `${hour.toString().padStart(2, "0")}:00`

    // Generate some base patterns for the day
    let baseValue = 0
    if (hour >= 7 && hour <= 10) {
      // Morning rush
      baseValue = 60 + (hour - 7) * 10
    } else if (hour >= 11 && hour <= 15) {
      // Midday
      baseValue = 80 - (hour - 11) * 5
    } else if (hour >= 16 && hour <= 19) {
      // Evening rush
      baseValue = 60 + (hour - 16) * 10
    } else {
      baseValue = 30 + Math.sin(hour / 3) * 10
    }

    // Add some randomness based on location
    const x = Math.sin(seed + i) * 10000
    const randomFactor = (x - Math.floor(x)) * 15 - 7.5

    data.push({
      hour: hourString,
      value: Math.max(0, Math.min(100, Math.round(baseValue + randomFactor))),
    })
  }

  return data
}

const generateWeeklyData = (location: string) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const now = new Date()
  const currentDay = now.getDay()

  // Reorder days to put today at the end
  const orderedDays = [...days.slice((currentDay + 1) % 7), ...days.slice(0, (currentDay + 1) % 7)]

  // Use location to seed the random generator
  const seed = location.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)

  return orderedDays.map((day, index) => {
    const x = Math.sin(seed + index) * 10000
    const randomFactor = (x - Math.floor(x)) * 20 - 10

    // Generate base values: weekdays higher than weekends
    const isWeekend = day === "Sat" || day === "Sun"
    const baseValue = isWeekend ? 50 : 70

    return {
      day,
      value: Math.max(0, Math.min(100, Math.round(baseValue + randomFactor))),
    }
  })
}

export function DensityTrends({ location }: DensityTrendsProps) {
  const [dailyData, setDailyData] = useState(() => generateDailyData(location))
  const [weeklyData, setWeeklyData] = useState(() => generateWeeklyData(location))
  const [timeframe, setTimeframe] = useState("daily")

  // Update data when location changes
  useEffect(() => {
    setDailyData(generateDailyData(location))
    setWeeklyData(generateWeeklyData(location))
  }, [location])

  // Calculate current hour for reference line
  const now = new Date()
  const currentHour = `${now.getHours().toString().padStart(2, "0")}:00`
  const today = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()]

  return (
    <div className="space-y-4">
      <Tabs defaultValue="daily" value={timeframe} onValueChange={setTimeframe} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily">Daily (24h)</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="pt-4">
          <ChartContainer
            config={{
              value: {
                label: "Density",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  minTickGap={30}
                  tickFormatter={(value) => value}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceLine
                  x={currentHour}
                  stroke="hsl(var(--foreground))"
                  strokeDasharray="3 3"
                  label={{ value: "Now", position: "top", fill: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} className="fill-primary" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </TabsContent>

        <TabsContent value="weekly" className="pt-4">
          <ChartContainer
            config={{
              value: {
                label: "Density",
                color: "hsl(var(--chart-5))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceLine
                  x={today}
                  stroke="hsl(var(--foreground))"
                  strokeDasharray="3 3"
                  label={{ value: "Today", position: "top", fill: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} className="fill-primary" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </TabsContent>
      </Tabs>
    </div>
  )
}

