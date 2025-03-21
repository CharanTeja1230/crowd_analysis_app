"use client"

import { useEffect, useState, useMemo } from "react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CurrentDensityProps {
  location: string
  density?: number
}

// Sample data generator
const generateData = (currentValue: number) => {
  const now = new Date()
  const data = []

  for (let i = 30; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000)
    const hours = time.getHours().toString().padStart(2, "0")
    const minutes = time.getMinutes().toString().padStart(2, "0")
    const timeString = `${hours}:${minutes}`

    // Generate a somewhat realistic pattern with some randomness
    const baseValue = Math.max(30, Math.min(95, currentValue - i / 2 + Math.sin(i / 5) * 15))
    const randomFactor = Math.random() * 6 - 3
    const value = Math.min(100, Math.max(0, baseValue + randomFactor))

    data.push({
      time: timeString,
      value: Math.round(value),
    })
  }

  return data
}

export function CurrentDensity({ location, density = 65 }: CurrentDensityProps) {
  const [data, setData] = useState(() => generateData(density))

  // Update data when density changes
  useEffect(() => {
    setData(generateData(density))
  }, [density, location])

  // Update data every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = [...data.slice(1)]
      const lastTime = new Date()
      const hours = lastTime.getHours().toString().padStart(2, "0")
      const minutes = lastTime.getMinutes().toString().padStart(2, "0")
      const timeString = `${hours}:${minutes}`

      const lastValue = newData[newData.length - 1].value
      const change = Math.random() * 6 - 3
      const newValue = Math.min(100, Math.max(0, lastValue + change))

      newData.push({
        time: timeString,
        value: Math.round(newValue),
      })

      setData(newData)
    }, 60000)

    return () => clearInterval(interval)
  }, [data])

  const currentValue = data[data.length - 1].value

  const densityStatus = useMemo(() => {
    if (currentValue < 40) return { label: "Low", className: "density-low", bgClass: "density-bg-low" }
    if (currentValue < 70) return { label: "Medium", className: "density-medium", bgClass: "density-bg-medium" }
    return { label: "High", className: "density-high", bgClass: "density-bg-high" }
  }, [currentValue])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <div className="text-4xl font-bold">{currentValue}%</div>
            <div className="text-sm text-muted-foreground">Current crowd density</div>
          </div>
          <Badge className={cn("ml-2", densityStatus.bgClass)}>{densityStatus.label}</Badge>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-sm text-muted-foreground">Low (&lt;40%)</span>
          <div className="h-3 w-3 rounded-full bg-amber-500" />
          <span className="text-sm text-muted-foreground">Medium (40-70%)</span>
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-sm text-muted-foreground">High (&gt;70%)</span>
        </div>
      </div>

      <ChartContainer
        config={{
          value: {
            label: "Density",
            color:
              currentValue < 40
                ? "hsl(var(--chart-1))"
                : currentValue < 70
                  ? "hsl(var(--chart-2))"
                  : "hsl(var(--chart-3))",
          },
        }}
        className="h-[300px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="time"
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
            <Line
              type="monotone"
              dataKey="value"
              strokeWidth={2}
              activeDot={{ r: 6, style: { fill: "var(--color-value)", opacity: 0.8 } }}
              isAnimationActive={false}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}

