"use client"

import { Bookmark, BookmarkCheck, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLocationStore } from "@/lib/stores/location-store"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"

export function LocationDisplay() {
  const { currentLocation, setCurrentLocation, bookmarkedLocations, toggleBookmark, isBookmarked, recentLocations } =
    useLocationStore()
  const { toast } = useToast()

  const isCurrentLocationBookmarked = isBookmarked(currentLocation)

  const handleToggleBookmark = () => {
    toggleBookmark(currentLocation)

    toast({
      title: isCurrentLocationBookmarked ? "Location removed from bookmarks" : "Location bookmarked",
      description: isCurrentLocationBookmarked
        ? `${currentLocation} has been removed from your bookmarks`
        : `${currentLocation} has been added to your bookmarks`,
    })
  }

  return (
    <div className="flex items-center gap-1 h-9">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1 min-w-40">
            <span className="truncate">{currentLocation}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuLabel>Current Location</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleToggleBookmark}>
            {isCurrentLocationBookmarked ? (
              <motion.div
                className="flex items-center w-full"
                initial={{ x: -5 }}
                animate={{ x: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <BookmarkCheck className="mr-2 h-4 w-4 text-primary" />
                <span>Remove Bookmark</span>
              </motion.div>
            ) : (
              <motion.div
                className="flex items-center w-full"
                initial={{ x: -5 }}
                animate={{ x: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Bookmark className="mr-2 h-4 w-4" />
                <span>Add Bookmark</span>
              </motion.div>
            )}
          </DropdownMenuItem>

          {bookmarkedLocations.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Bookmarked Locations</DropdownMenuLabel>
              {bookmarkedLocations.map((location) => (
                <DropdownMenuItem key={location} onClick={() => setCurrentLocation(location)}>
                  <BookmarkCheck className="mr-2 h-4 w-4 text-primary" />
                  <span>{location}</span>
                </DropdownMenuItem>
              ))}
            </>
          )}

          {recentLocations.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Recent Locations</DropdownMenuLabel>
              {recentLocations.slice(0, 3).map((location) => (
                <DropdownMenuItem key={location} onClick={() => setCurrentLocation(location)}>
                  <span>{location}</span>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

