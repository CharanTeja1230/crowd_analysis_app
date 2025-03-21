"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Search, Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FileUploader } from "./file-uploader"

const HYDERABAD_LOCATIONS = [
  "Uppal",
  "Bod Uppal",
  "Narapally",
  "Ghatkesar",
  "Miyapur",
  "Hitech City",
  "Kukatpally",
  "Ameerpet",
  "Dilsukhnagar",
  "LB Nagar",
  "Mehdipatnam",
]

export function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showUploader, setShowUploader] = useState(false)
  const [filteredLocations, setFilteredLocations] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.trim() === "") {
      setFilteredLocations([])
      return
    }

    const filtered = HYDERABAD_LOCATIONS.filter((location) => location.toLowerCase().includes(value.toLowerCase()))
    setFilteredLocations(filtered)
  }

  const handleLocationSelect = (location: string) => {
    setSearchTerm(location)
    setFilteredLocations([])
    // Here you would typically trigger a location change in your app
  }

  const toggleUploader = () => {
    setShowUploader(!showUploader)
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-1 z-10 h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={toggleUploader}
        >
          {showUploader ? <X size={18} /> : <Plus size={18} />}
        </Button>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search locations..."
          value={searchTerm}
          onChange={handleSearch}
          className="pl-10 h-10 w-full"
        />
        <Search className="absolute right-3 h-4 w-4 text-muted-foreground" />
      </div>

      {filteredLocations.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
          <ul className="py-1">
            {filteredLocations.map((location) => (
              <li
                key={location}
                className="px-4 py-2 hover:bg-muted cursor-pointer"
                onClick={() => handleLocationSelect(location)}
              >
                {location}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showUploader && (
        <div className="absolute z-20 mt-1 w-full rounded-md border bg-background shadow-lg p-4">
          <FileUploader onClose={toggleUploader} />
        </div>
      )}
    </div>
  )
}

