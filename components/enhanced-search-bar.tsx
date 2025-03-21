"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, Plus, X, History } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLocationStore } from "@/lib/stores/location-store"
import { cn } from "@/lib/utils"

interface EnhancedSearchBarProps {
  onPlusClick: () => void
  showUploadPanel: boolean
}

export function EnhancedSearchBar({ onPlusClick, showUploadPanel }: EnhancedSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const { currentLocation, setCurrentLocation, locations, recentLocations, addToRecentLocations } = useLocationStore()
  const [filteredLocations, setFilteredLocations] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [showRecent, setShowRecent] = useState(false)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.trim() === "") {
      setFilteredLocations([])
      return
    }

    const filtered = locations.filter((location) => location.toLowerCase().includes(value.toLowerCase()))
    setFilteredLocations(filtered)
    setIsSearching(true)
  }

  const handleLocationSelect = (location: string) => {
    setSearchTerm("")
    setFilteredLocations([])
    setIsSearching(false)
    setCurrentLocation(location)
    addToRecentLocations(location)
  }

  // Handle clicks outside the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        listRef.current &&
        !listRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsSearching(false)
        setShowRecent(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute left-1 z-10 h-7 w-7 hover:bg-muted transition-colors",
            showUploadPanel ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
          onClick={onPlusClick}
        >
          {showUploadPanel ? <X size={16} /> : <Plus size={16} />}
        </Button>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search locations..."
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => {
            if (searchTerm.trim() === "" && recentLocations.length > 0) {
              setShowRecent(true)
            } else {
              setIsSearching(true)
            }
          }}
          className="pl-9 h-9 w-full pr-9"
        />
        <Search className="absolute right-3 h-4 w-4 text-muted-foreground" />
      </div>

      {filteredLocations.length > 0 && isSearching && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-lg animate-fade-in"
        >
          <ul className="py-1 max-h-64 overflow-y-auto custom-scrollbar">
            {filteredLocations.map((location) => (
              <li
                key={location}
                className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-2"
                onClick={() => handleLocationSelect(location)}
              >
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{location}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showRecent && recentLocations.length > 0 && searchTerm.trim() === "" && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-lg animate-fade-in"
        >
          <div className="py-1 px-3 text-xs font-medium text-muted-foreground">Recent Locations</div>
          <ul className="py-1 max-h-64 overflow-y-auto custom-scrollbar">
            {recentLocations.map((location) => (
              <li
                key={location}
                className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-2"
                onClick={() => handleLocationSelect(location)}
              >
                <History className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{location}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

