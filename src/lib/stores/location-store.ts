import { create } from "zustand"
import { persist } from "zustand/middleware"

interface LocationState {
  currentLocation: string
  locations: string[]
  recentLocations: string[]
  bookmarkedLocations: string[]
  setCurrentLocation: (location: string) => void
  addToRecentLocations: (location: string) => void
  toggleBookmark: (location: string) => void
  isBookmarked: (location: string) => boolean
  searchLocations: (query: string) => string[]
}

export const LOCATIONS = [
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
  "Begumpet",
  "Secunderabad",
  "Jubilee Hills",
  "Gachibowli",
  "Madhapur",
  "KPHB",
  "Paradise",
  "Malakpet",
  "Charminar",
  "Times Square",
  "Grand Central",
  "Central Park",
  "Brooklyn Bridge",
  "Piccadilly Circus",
  "Oxford Street",
  "Trafalgar Square",
  "Covent Garden",
  "Shibuya Crossing",
  "Shinjuku",
  "Akihabara",
  "Tokyo Tower",
]

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      currentLocation: "Hitech City",
      locations: LOCATIONS,
      recentLocations: [],
      bookmarkedLocations: [],

      setCurrentLocation: (location: string) => {
        set({ currentLocation: location })
        get().addToRecentLocations(location)
      },

      addToRecentLocations: (location: string) => {
        const current = get().recentLocations
        // Remove if exists and add to front
        const filtered = current.filter((loc) => loc !== location)
        // Limit to 5 recent locations
        const updated = [location, ...filtered].slice(0, 5)
        set({ recentLocations: updated })
      },

      toggleBookmark: (location: string) => {
        const current = get().bookmarkedLocations
        if (current.includes(location)) {
          set({ bookmarkedLocations: current.filter((loc) => loc !== location) })
        } else {
          set({ bookmarkedLocations: [...current, location] })
        }
      },

      isBookmarked: (location: string) => {
        return get().bookmarkedLocations.includes(location)
      },

      searchLocations: (query: string) => {
        if (!query) return []

        const locations = get().locations

        // Fuzzy search implementation
        return locations.filter((location) => {
          // Direct match
          if (location.toLowerCase().includes(query.toLowerCase())) {
            return true
          }

          // Fuzzy match (allow for typos)
          const locationChars = location.toLowerCase().split("")
          const queryChars = query.toLowerCase().split("")

          let locationIndex = 0
          for (const char of queryChars) {
            // Find the next occurrence of the character
            const nextIndex = locationChars.indexOf(char, locationIndex)

            // If character not found, no match
            if (nextIndex === -1) {
              return false
            }

            // Move the index forward
            locationIndex = nextIndex + 1
          }

          // If we got through all characters, it's a match
          return true
        })
      },
    }),
    {
      name: "location-storage",
    },
  ),
)

