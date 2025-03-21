"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { EnhancedSearchBar } from "@/components/enhanced-search-bar"
import { NotificationCenter } from "@/components/notification-center"
import { LocationDisplay } from "@/components/location-display"
import { QuickUpload } from "@/components/quick-upload"
import { LiveFeedMini } from "@/components/live-feed-mini"
import { useAuth } from "@/context/auth-context"
import {
  Loader2,
  LayoutDashboard,
  Map,
  AlertTriangle,
  BarChart3,
  Settings,
  Upload,
  Camera,
  History,
  Bookmark,
  Users,
  Database,
  Shield,
  LogOut,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const { user, isLoading, logout } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()
  const [showQuickUpload, setShowQuickUpload] = useState(false)
  const [showMiniLiveFeed, setShowMiniLiveFeed] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)

    // Show welcome toast on initial load
    setTimeout(() => {
      if (user) {
        toast({
          title: `Welcome back, ${user.name}`,
          description: "Monitoring crowd metrics in real-time",
          duration: 5000,
        })
      }
    }, 1000)
  }, [user])

  const toggleQuickUpload = () => {
    setShowQuickUpload(!showQuickUpload)
    if (showMiniLiveFeed) setShowMiniLiveFeed(false)
  }

  const toggleMiniLiveFeed = () => {
    setShowMiniLiveFeed(!showMiniLiveFeed)
    if (showQuickUpload) setShowQuickUpload(false)
  }

  if (isLoading || !mounted) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium loading-dots">Loading dashboard</p>
      </div>
    )
  }

  if (!user) {
    router.push("/login")
    return null
  }

  const isAdmin = user.role === "admin"

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar variant="sidebar" collapsible="icon" className="border-r">
          <SidebarHeader className="flex items-center justify-center py-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">CA</span>
              </div>
              <span className="font-bold text-lg">Crowd Analyzer</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"} tooltip="Dashboard">
                  <a href="/dashboard">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/analytics"} tooltip="Analytics">
                  <a href="/dashboard/analytics">
                    <BarChart3 className="h-5 w-5" />
                    <span>Analytics</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/heatmaps"} tooltip="Heat Maps">
                  <a href="/dashboard/heatmaps">
                    <Map className="h-5 w-5" />
                    <span>Heat Maps</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/anomalies"} tooltip="Anomalies">
                  <a href="/dashboard/anomalies">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Anomalies</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/upload"} tooltip="Upload">
                  <a href="/dashboard/upload">
                    <Upload className="h-5 w-5" />
                    <span>Upload</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/live"} tooltip="Live Feed">
                  <a href="/dashboard/live">
                    <Camera className="h-5 w-5" />
                    <span>Live Feed</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/locations"} tooltip="Saved Locations">
                  <a href="/dashboard/locations">
                    <Bookmark className="h-5 w-5" />
                    <span>Saved Locations</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/history"} tooltip="History">
                  <a href="/dashboard/history">
                    <History className="h-5 w-5" />
                    <span>History</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {isAdmin && (
                <>
                  <Separator className="my-2" />
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard/admin/users"}
                      tooltip="User Management"
                    >
                      <a href="/dashboard/admin/users">
                        <Users className="h-5 w-5" />
                        <span>User Management</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard/admin/sensors"}
                      tooltip="Sensor Management"
                    >
                      <a href="/dashboard/admin/sensors">
                        <Database className="h-5 w-5" />
                        <span>Sensor Management</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/admin/security"} tooltip="Security">
                      <a href="/dashboard/admin/security">
                        <Shield className="h-5 w-5" />
                        <span>Security</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/settings"} tooltip="Settings">
                  <a href="/dashboard/settings">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={logout} tooltip="Logout">
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className={cn("flex flex-col")}>
          <header className="border-b px-3 py-2 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <SidebarTrigger />
                <EnhancedSearchBar onPlusClick={toggleQuickUpload} showUploadPanel={showQuickUpload} />
                <div className="ml-1 flex gap-1">
                  <LocationDisplay />
                  <Separator orientation="vertical" className="h-8" />
                  <button
                    onClick={toggleMiniLiveFeed}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 text-sm rounded-md hover:bg-muted transition-colors",
                      showMiniLiveFeed && "bg-muted",
                    )}
                  >
                    <Camera className="h-4 w-4" />
                    <span className="hidden sm:inline">Live Feed</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <NotificationCenter />
                <ModeToggle />
              </div>
            </div>
            <AnimatePresence>
              {(showQuickUpload || showMiniLiveFeed) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="py-2"
                >
                  {showQuickUpload && <QuickUpload onClose={toggleQuickUpload} />}
                  {showMiniLiveFeed && <LiveFeedMini onClose={toggleMiniLiveFeed} />}
                </motion.div>
              )}
            </AnimatePresence>
          </header>
          <main className="flex-1 overflow-auto p-4 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

