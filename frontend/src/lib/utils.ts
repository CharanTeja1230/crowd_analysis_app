import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function getRandomColor(): string {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export function getDensityColor(density: number): string {
  if (density < 40) return "density-low"
  if (density < 70) return "density-medium"
  if (density < 85) return "density-high"
  return "density-critical"
}

export function getDensityBgColor(density: number): string {
  if (density < 40) return "density-bg-low"
  if (density < 70) return "density-bg-medium"
  if (density < 85) return "density-bg-high"
  return "density-bg-critical"
}

export function getDensityLabel(density: number): string {
  if (density < 40) return "Low"
  if (density < 70) return "Medium"
  if (density < 85) return "High"
  return "Critical"
}

