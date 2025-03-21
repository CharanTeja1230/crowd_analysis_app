import { create } from "zustand"
import { persist } from "zustand/middleware"

export type SensorStatus = "online" | "offline" | "warning"
export type SensorType = "crowd" | "temperature" | "humidity" | "air-quality" | "motion"

export interface Sensor {
  id: string
  name: string
  location: string
  type: SensorType
  status: SensorStatus
  battery: number
  lastUpdated: string
  data?: {
    value: number
    unit: string
  }
}

interface SensorState {
  sensors: Sensor[]
  addSensor: (sensor: Sensor) => void
  updateSensor: (id: string, updates: Partial<Sensor>) => void
  removeSensor: (id: string) => void
  getSensorsByLocation: (location: string) => Sensor[]
  getSensorsByType: (type: SensorType) => Sensor[]
  getActiveSensors: () => Sensor[]
}

// Generate some initial sensors
const generateInitialSensors = (): Sensor[] => {
  const locations = ["Hitech City", "Uppal", "Miyapur", "Ameerpet", "Dilsukhnagar", "Secunderabad", "Gachibowli"]

  const types: SensorType[] = ["crowd", "temperature", "humidity", "air-quality", "motion"]
  const statuses: SensorStatus[] = ["online", "online", "online", "warning", "offline"]

  const sensors: Sensor[] = []

  // Create 2-4 sensors for each location
  locations.forEach((location) => {
    const sensorCount = Math.floor(Math.random() * 3) + 2 // 2-4 sensors

    for (let i = 0; i < sensorCount; i++) {
      const type = types[Math.floor(Math.random() * types.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const battery = Math.floor(Math.random() * 60) + 40 // 40-100%

      let data
      if (type === "crowd") {
        data = { value: Math.floor(Math.random() * 100), unit: "%" }
      } else if (type === "temperature") {
        data = { value: Math.floor(Math.random() * 15) + 20, unit: "°C" }
      } else if (type === "humidity") {
        data = { value: Math.floor(Math.random() * 60) + 30, unit: "%" }
      } else if (type === "air-quality") {
        data = { value: Math.floor(Math.random() * 100) + 20, unit: "AQI" }
      }

      sensors.push({
        id: `${location.toLowerCase().replace(/\s+/g, "-")}-${type}-${i}`,
        name: `${location} ${type.charAt(0).toUpperCase() + type.slice(1)} Sensor ${i + 1}`,
        location,
        type,
        status,
        battery,
        lastUpdated: new Date().toISOString(),
        data,
      })
    }
  })

  return sensors
}

export const useSensorStore = create<SensorState>()(
  persist(
    (set, get) => ({
      sensors: generateInitialSensors(),

      addSensor: (sensor: Sensor) => {
        set((state) => ({
          sensors: [...state.sensors, sensor],
        }))
      },

      updateSensor: (id: string, updates: Partial<Sensor>) => {
        set((state) => ({
          sensors: state.sensors.map((sensor) => (sensor.id === id ? { ...sensor, ...updates } : sensor)),
        }))
      },

      removeSensor: (id: string) => {
        set((state) => ({
          sensors: state.sensors.filter((sensor) => sensor.id !== id),
        }))
      },

      getSensorsByLocation: (location: string) => {
        return get().sensors.filter((sensor) => sensor.location.toLowerCase() === location.toLowerCase())
      },

      getSensorsByType: (type: SensorType) => {
        return get().sensors.filter((sensor) => sensor.type === type)
      },

      getActiveSensors: () => {
        return get().sensors.filter((sensor) => sensor.status === "online")
      },
    }),
    {
      name: "sensor-storage",
    },
  ),
)

