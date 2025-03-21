"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

// Mock user data
const MOCK_USERS = [
  {
    id: "1",
    email: "admin@example.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
  },
  {
    id: "2",
    email: "user@example.com",
    password: "user123",
    name: "Regular User",
    role: "user",
  },
]

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("user")

        if (!storedUser) {
          setIsLoading(false)
          // If on protected route, redirect to login
          if (pathname !== "/login" && pathname !== "/register" && pathname !== "/") {
            router.push("/login")
          }
          return
        }

        setUser(JSON.parse(storedUser))

        // If on login/register page, redirect to dashboard
        if (pathname === "/login" || pathname === "/register") {
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Auth error:", error)
        localStorage.removeItem("user")
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const user = MOCK_USERS.find((u) => u.email === email && u.password === password)

      if (!user) {
        throw new Error("Invalid email or password")
      }

      const { password: _, ...userWithoutPassword } = user

      localStorage.setItem("user", JSON.stringify(userWithoutPassword))
      setUser(userWithoutPassword)

      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if user already exists
      if (MOCK_USERS.some((u) => u.email === email)) {
        throw new Error("User already exists with this email")
      }

      // In a real app, we would save this to a database
      // For this demo, we'll just create a new user object
      const newUser = {
        id: `${MOCK_USERS.length + 1}`,
        email,
        name,
        role: "user" as const,
      }

      localStorage.setItem("user", JSON.stringify(newUser))
      setUser(newUser)

      toast({
        title: "Registration successful",
        description: `Welcome, ${name}!`,
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Please try again with different credentials",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
    router.push("/login")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

