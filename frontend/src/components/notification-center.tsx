"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { useLocationStore } from "@/lib/stores/location-store"
import { motion, AnimatePresence } from "framer-motion"

// Notification type
interface Notification {
  id: number
  title: string
  description: string
  time: string
  timestamp: Date
  read: boolean
  type: "alert" | "anomaly" | "prediction" | "system"
}

// Generate new test notification
function generateNotification(location: string, lastId: number): Notification {
  const types = ["alert", "anomaly", "prediction", "system"] as const
  const type = types[Math.floor(Math.random() * types.length)]

  const alerts = ["High density detected", "Critical crowd level", "Density threshold exceeded"]

  const anomalies = ["Unusual dispersal pattern", "Sudden movement detected", "Anomaly detected"]

  const predictions = ["High crowd predicted", "Peak density expected", "Traffic surge predicted"]

  const systems = ["Sensor recalibrated", "System update completed", "Connection restored"]

  const titles = {
    alert: alerts[Math.floor(Math.random() * alerts.length)],
    anomaly: anomalies[Math.floor(Math.random() * anomalies.length)],
    prediction: predictions[Math.floor(Math.random() * predictions.length)],
    system: systems[Math.floor(Math.random() * systems.length)],
  }

  return {
    id: lastId + 1,
    title: titles[type],
    description: `${titles[type]} at ${location}`,
    time: "Just now",
    timestamp: new Date(),
    read: false,
    type,
  }
}

// Sample notifications data
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: "High density detected",
    description: "Unusual crowd density at Uppal",
    time: "2 minutes ago",
    timestamp: new Date(Date.now() - 2 * 60000),
    read: false,
    type: "alert",
  },
  {
    id: 2,
    title: "Anomaly detected",
    description: "Sudden dispersal at Hitech City",
    time: "10 minutes ago",
    timestamp: new Date(Date.now() - 10 * 60000),
    read: false,
    type: "anomaly",
  },
  {
    id: 3,
    title: "Prediction",
    description: "High crowd expected at Ghatkesar by 5 PM",
    time: "30 minutes ago",
    timestamp: new Date(Date.now() - 30 * 60000),
    read: true,
    type: "prediction",
  },
  {
    id: 4,
    title: "Sensor update",
    description: "Temperature sensor recalibrated at Miyapur",
    time: "1 hour ago",
    timestamp: new Date(Date.now() - 60 * 60000),
    read: true,
    type: "system",
  },
]

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { currentLocation } = useLocationStore()
  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  // Simulate new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // 20% chance of new notification
      if (Math.random() < 0.2) {
        const lastId = notifications.length > 0 ? Math.max(...notifications.map((n) => n.id)) : 0

        const newNotification = generateNotification(currentLocation, lastId)
        setNotifications((prev) => [newNotification, ...prev].slice(0, 10))

        // Show toast for critical alerts
        if (newNotification.type === "alert") {
          toast({
            title: newNotification.title,
            description: newNotification.description,
            variant: "destructive",
          })
        }
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [notifications, currentLocation])

  // Update time strings
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications((prev) =>
        prev.map((notification) => {
          const secondsAgo = Math.floor((new Date().getTime() - notification.timestamp.getTime()) / 1000)

          let timeString = "Just now"
          if (secondsAgo >= 60 && secondsAgo < 3600) {
            timeString = `${Math.floor(secondsAgo / 60)} minute${Math.floor(secondsAgo / 60) === 1 ? "" : "s"} ago`
          } else if (secondsAgo >= 3600 && secondsAgo < 86400) {
            timeString = `${Math.floor(secondsAgo / 3600)} hour${Math.floor(secondsAgo / 3600) === 1 ? "" : "s"} ago`
          } else if (secondsAgo >= 86400) {
            timeString = `${Math.floor(secondsAgo / 86400)} day${Math.floor(secondsAgo / 86400) === 1 ? "" : "s"} ago`
          } else if (secondsAgo > 10) {
            timeString = `${secondsAgo} seconds ago`
          }

          return { ...notification, time: timeString }
        }),
      )
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <span className="flex h-2 w-2 rounded-full bg-red-500" />
      case "anomaly":
        return <span className="flex h-2 w-2 rounded-full bg-amber-500" />
      case "prediction":
        return <span className="flex h-2 w-2 rounded-full bg-blue-500" />
      default:
        return <span className="flex h-2 w-2 rounded-full bg-green-500" />
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full h-9 w-9">
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto text-xs px-2" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[350px] overflow-y-auto custom-scrollbar">
          {notifications.length > 0 ? (
            <AnimatePresence initial={false}>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <DropdownMenuItem
                    className={cn("flex flex-col items-start p-3 cursor-pointer", !notification.read && "bg-muted/50")}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex w-full gap-2">
                      <div className="mt-1">{getTypeIcon(notification.type)}</div>
                      <div className="flex-1">
                        <div className="flex w-full justify-between">
                          <span className="font-medium">{notification.title}</span>
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="p-4 text-center text-muted-foreground">No notifications</div>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <a href="/dashboard/notifications" className="w-full text-center text-sm">
            View all notifications
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

