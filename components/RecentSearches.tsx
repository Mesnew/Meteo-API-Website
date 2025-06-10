"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Trash2, RefreshCw } from "lucide-react"

interface SearchHistory {
  id: string
  ville: string
  date: string
  time: string
  timestamp: number
  result?: {
    pleuvait: boolean
    temperature?: number
    precipitation?: number
  }
}

interface RecentSearchesProps {
  onSelectSearch: (search: SearchHistory) => void
}

export function RecentSearches({ onSelectSearch }: RecentSearchesProps) {
  const [searches, setSearches] = useState<SearchHistory[]>([])

  useEffect(() => {
    loadSearchHistory()
  }, [])

  const loadSearchHistory = () => {
    try {
      const history = localStorage.getItem("weather-search-history")
      if (history) {
        const parsed = JSON.parse(history)
        setSearches(parsed.slice(0, 5)) // Garder seulement les 5 dernières
      }
    } catch (error) {
      console.warn("Erreur lors du chargement de l'historique:", error)
    }
  }

  const addToHistory = (search: Omit<SearchHistory, "id" | "timestamp">) => {
    const newSearch: SearchHistory = {
      ...search,
      id: Date.now().toString(),
      timestamp: Date.now(),
    }

    const updatedSearches = [
      newSearch,
      ...searches.filter((s) => !(s.ville === search.ville && s.date === search.date && s.time === search.time)),
    ].slice(0, 5)

    setSearches(updatedSearches)

    try {
      localStorage.setItem("weather-search-history", JSON.stringify(updatedSearches))
    } catch (error) {
      console.warn("Erreur lors de la sauvegarde de l'historique:", error)
    }
  }

  const clearHistory = () => {
    setSearches([])
    localStorage.removeItem("weather-search-history")
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Exposer la fonction addToHistory pour l'utiliser depuis le parent
  useEffect(() => {
    ;(window as any).addToSearchHistory = addToHistory
  }, [searches])

  if (searches.length === 0) {
    return null
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              Recherches récentes
            </CardTitle>
            <CardDescription>Vos dernières consultations météo</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={clearHistory}>
            <Trash2 className="h-4 w-4 mr-1" />
            Effacer
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {searches.map((search) => (
            <div
              key={search.id}
              className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => onSelectSearch(search)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{search.ville}</span>
                  {search.result && (
                    <Badge
                      className={search.result.pleuvait ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}
                    >
                      {search.result.pleuvait ? "🌧️ Pluie" : "☀️ Sec"}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(search.date)} à {search.time} • Consulté le {formatTime(search.timestamp)}
                </div>
                {search.result && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {search.result.temperature && `${search.result.temperature.toFixed(1)}°C`}
                    {search.result.precipitation !== undefined && ` • ${search.result.precipitation.toFixed(1)}mm`}
                  </div>
                )}
              </div>
              <RefreshCw className="h-4 w-4 text-gray-400" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
