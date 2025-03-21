"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import { useToast } from "@/components/ui/use-toast"

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
  loginWithGoogle: () => Promise<void>
  loginWithLinkedIn: () => Promise<void>
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
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          setIsLoading(false)
          // If on protected route, redirect to login
          if (pathname !== "/login" && pathname !== "/register" && pathname !== "/") {
            router.push("/login")
          }
          return
        }

        // Verify token with backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          // Decode token to get user info
          const decoded = jwtDecode<User & { exp: number }>(token)

          // Check if token is expired
          const currentTime = Date.now() / 1000
          if (decoded.exp < currentTime) {
            localStorage.removeItem("token")
            setUser(null)
            if (pathname !== "/login" && pathname !== "/register" && pathname !== "/") {
              router.push("/login")
            }
          } else {
            setUser({
              id: decoded.id,
              email: decoded.email,
              name: decoded.name,
              role: decoded.role,
            })

            // If on login/register page, redirect to dashboard
            if (pathname === "/login" || pathname === "/register") {
              router.push("/dashboard")
            }
          }
        } else {
          localStorage.removeItem("token")
          setUser(null)
          if (pathname !== "/login" && pathname !== "/register" && pathname !== "/") {
            router.push("/login")
          }
        }
      } catch (error) {
        console.error("Auth error:", error)
        localStorage.removeItem("token")
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      localStorage.setItem("token", data.token)

      // Decode token to get user info
      const decoded = jwtDecode<User>(data.token)
      setUser({
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      })

      toast({
        title: "Login successful",
        description: `Welcome back, ${decoded.name}!`,
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      localStorage.setItem("token", data.token)

      // Decode token to get user info
      const decoded = jwtDecode<User>(data.token)
      setUser({
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      })

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

  const loginWithGoogle = async () => {
    // This would typically open a popup for Google OAuth
    // For now, we'll simulate it
    setIsLoading(true)
    try {
      window.open(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, "_self")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google login failed",
        description: error.message || "Please try again",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithLinkedIn = async () => {
    // This would typically open a popup for LinkedIn OAuth
    // For now, we'll simulate it
    setIsLoading(true)
    try {
      window.open(`${process.env.NEXT_PUBLIC_API_URL}/auth/linkedin`, "_self")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "LinkedIn login failed",
        description: error.message || "Please try again",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
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
        loginWithGoogle,
        loginWithLinkedIn,
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

