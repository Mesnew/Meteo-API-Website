"use client"

import { useState, useEffect, useCallback } from "react"

interface WeatherParams {
  apiKey: string
  stationId: string
  dateDebut: string
  dateFin: string
}

interface WeatherData {
  temperature?: number
  precipitation?: number
  humidity?: number
  windSpeed?: number
  pressure?: number
  conditions: string
  pleuvait: boolean
  dataSource: "api" | "unavailable"
}

interface UseWeatherDataReturn {
  data: WeatherData | null
  loading: boolean
  error: string | null
  refetch: () => void
}

// Version simplifiée sans localStorage pour éviter les problèmes avec le Service Worker
export function useWeatherData(params: WeatherParams | null): UseWeatherDataReturn {
  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWeatherData = useCallback(async (params: WeatherParams) => {
    setLoading(true)
    setError(null)

    try {
      // Étape 1: Commander les données
      const commandeResponse = await fetch("/api/meteo-france/commande", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })

      const commandeData = await commandeResponse.json()

      if (!commandeResponse.ok) {
        throw new Error(`Erreur commande: ${commandeData.error}`)
      }

      // Attendre que les données soient prêtes
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Étape 2: Télécharger les données
      const downloadResponse = await fetch("/api/meteo-france/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: params.apiKey,
          commandeId: commandeData.commandeId,
        }),
      })

      const downloadData = await downloadResponse.json()

      if (!downloadResponse.ok) {
        throw new Error(`Erreur téléchargement: ${downloadData.error}`)
      }

      let weatherData: WeatherData

      if (downloadData.success && downloadData.status === "ready") {
        const parsedData = parseCSVData(downloadData.data)

        weatherData = {
          temperature: parsedData?.temperature,
          precipitation: parsedData?.precipitation || 0,
          humidity: parsedData?.humidity,
          windSpeed: parsedData?.windSpeed,
          pressure: parsedData?.pressure,
          conditions: determinerConditions(parsedData?.precipitation || 0, parsedData?.temperature),
          pleuvait: (parsedData?.precipitation || 0) > 0,
          dataSource: "api",
        }
      } else {
        weatherData = {
          conditions: "Données non disponibles",
          pleuvait: false,
          dataSource: "unavailable",
        }
      }

      setData(weatherData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur inconnue"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(() => {
    if (params) {
      fetchWeatherData(params)
    }
  }, [params, fetchWeatherData])

  useEffect(() => {
    if (params) {
      fetchWeatherData(params)
    }
  }, [params, fetchWeatherData])

  return { data, loading, error, refetch }
}

// Fonctions utilitaires
function parseCSVData(csvData: string) {
  try {
    const lines = csvData.split("\n")
    if (lines.length < 2) return null

    const headers = lines[0].split(";")
    const values = lines[1].split(";")

    const data: any = {}

    headers.forEach((header, index) => {
      const value = values[index]?.replace(",", ".")
      const numValue = Number.parseFloat(value)

      switch (header.trim()) {
        case "T":
          if (!isNaN(numValue)) data.temperature = numValue
          break
        case "RR1":
          if (!isNaN(numValue)) data.precipitation = numValue
          break
        case "U":
          if (!isNaN(numValue)) data.humidity = numValue
          break
        case "FF":
          if (!isNaN(numValue)) data.windSpeed = numValue
          break
        case "PMER":
          if (!isNaN(numValue)) data.pressure = numValue
          break
      }
    })

    return data
  } catch (error) {
    console.error("Erreur parsing CSV:", error)
    return null
  }
}

function determinerConditions(precipitation: number, temperature?: number) {
  if (precipitation > 5) return "Fortes précipitations"
  if (precipitation > 1) return "Précipitations modérées"
  if (precipitation > 0) return "Précipitations légères"
  if (temperature && temperature > 25) return "Temps chaud et sec"
  if (temperature && temperature < 5) return "Temps froid et sec"
  return "Temps sec"
}
