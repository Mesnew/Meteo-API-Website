"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Cloud, MapPin, Download, Clock, CheckCircle, Droplets, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Station {
  id: string
  nom: string
  lat: number
  lon: number
  alt: number
  posteOuvert: boolean
  typePoste: number
  distanceKm: number
  [key: string]: any
}

export default function MeteoPage() {
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [stations, setStations] = useState<Station[]>([])
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [commandeId, setCommandeId] = useState<string | null>(null)
  const [weatherData, setWeatherData] = useState<string | null>(null)
  const [precipitationInfo, setPrecipitationInfo] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const [rawResponse, setRawResponse] = useState("")

  const searchStations = async () => {
    if (!apiKey) {
      setError("Veuillez saisir votre token API Météo-France")
      return
    }

    setLoading(true)
    setError("")
    setStep(1)

    try {
      const response = await fetch(`/api/meteo-france/stations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      })

      const data = await response.json()
      setRawResponse(JSON.stringify(data, null, 2))

      if (!response.ok) {
        setError(`Erreur ${response.status}: ${data.error || "Erreur inconnue"}`)
        return
      }

      if (data.success && data.stations && data.stations.length > 0) {
        setStations(data.stations)
        setSelectedStation(data.stations[0]) // Sélectionner la station la plus proche
        setStep(2)
      } else {
        setError("Aucune station trouvée près d'Arenthon")
      }
    } catch (err) {
      setError(`Erreur de connexion: ${err instanceof Error ? err.message : "Erreur inconnue"}`)
    } finally {
      setLoading(false)
    }
  }

  const commanderDonnees = async () => {
    if (!apiKey || !selectedStation) {
      setError("Veuillez sélectionner une station météo")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Dates pour le samedi 7 juin 2025 (9h-10h UTC)
      const dateDebut = "2025-06-07T09:00:00Z"
      const dateFin = "2025-06-07T10:59:59Z"

      const response = await fetch(`/api/meteo-france/commande`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          stationId: selectedStation.id,
          dateDebut,
          dateFin,
        }),
      })

      const data = await response.json()
      setRawResponse(JSON.stringify(data, null, 2))

      if (!response.ok) {
        setError(`Erreur lors de la commande: ${data.error || "Erreur inconnue"}`)
        return
      }

      if (data.success && data.commandeId) {
        setCommandeId(data.commandeId)
        setStep(3)
      } else {
        setError("Impossible de créer la commande")
      }
    } catch (err) {
      setError(`Erreur: ${err instanceof Error ? err.message : "Erreur inconnue"}`)
    } finally {
      setLoading(false)
    }
  }

  const telechargerDonnees = async () => {
    if (!apiKey || !commandeId) {
      setError("Aucune commande à télécharger")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/meteo-france/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          commandeId,
        }),
      })

      const data = await response.json()
      setRawResponse(JSON.stringify(data, null, 2))

      if (!response.ok) {
        setError(`Erreur lors du téléchargement: ${data.error || "Erreur inconnue"}`)
        return
      }

      if (data.success && data.status === "ready") {
        setWeatherData(data.data)
        analyzePrecipitation(data.data)
        setStep(4)
      } else if (data.status === "pending") {
        setError("Les données sont encore en cours de préparation. Veuillez réessayer dans quelques instants.")
      } else if (data.status === "already_delivered") {
        setError("Cette commande a déjà été livrée.")
      } else {
        setError("Impossible de télécharger les données")
      }
    } catch (err) {
      setError(`Erreur: ${err instanceof Error ? err.message : "Erreur inconnue"}`)
    } finally {
      setLoading(false)
    }
  }

  const analyzePrecipitation = (csvData: string) => {
    try {
      const lines = csvData.split("\n")
      const headers = lines[0]?.split(";") || []

      // Chercher les colonnes de précipitations
      const precipColumns = headers
        .map((header, index) => ({ header: header.trim(), index }))
        .filter((col) => col.header.toLowerCase().includes("rr") || col.header.toLowerCase().includes("precip"))

      if (precipColumns.length === 0) {
        setPrecipitationInfo("❓ Aucune donnée de précipitation trouvée dans le fichier CSV")
        return
      }

      // Analyser les données pour la période 9h-10h
      let precipitationDetected = false
      let precipitationValue = 0
      const analysisDetails = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i]?.split(";") || []
        if (values.length < headers.length) continue

        const dateTime = values[0]?.trim()
        if (!dateTime || !dateTime.includes("2025-06-07")) continue

        // Vérifier si c'est dans la plage horaire 9h-10h
        if (dateTime.includes("T09:") || dateTime.includes("T10:")) {
          precipColumns.forEach((col) => {
            const value = Number.parseFloat(values[col.index]?.trim() || "0")
            if (value > 0) {
              precipitationDetected = true
              precipitationValue += value
              analysisDetails.push(`${dateTime}: ${value}mm (${col.header})`)
            }
          })
        }
      }

      if (precipitationDetected) {
        setPrecipitationInfo(
          `🌧️ OUI, il pleuvait ! Précipitations détectées: ${precipitationValue.toFixed(1)}mm\n\nDétails:\n${analysisDetails.join(
            "\n",
          )}`,
        )
      } else {
        setPrecipitationInfo(
          `☀️ NON, il ne pleuvait pas sur l'autoroute d'Arenthon le 7 juin 2025 entre 9h et 10h.\n\nAucune précipitation détectée dans les données de la station ${selectedStation?.nom}.`,
        )
      }
    } catch (err) {
      setPrecipitationInfo(`❌ Erreur lors de l'analyse: ${err instanceof Error ? err.message : "Erreur inconnue"}`)
    }
  }

  const getStepIcon = (stepNumber: number) => {
    if (step > stepNumber) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (step === stepNumber) return <Clock className="h-5 w-5 text-blue-500" />
    return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
  }

  const getTypePosteLabel = (type: number) => {
    const types = {
      0: "Automatique",
      1: "Principale",
      2: "Ordinaire",
      3: "Auxiliaire",
      4: "Spécialisée",
    }
    return types[type as keyof typeof types] || `Type ${type}`
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <Link href="/">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">🌧️ Météo Autoroute Arenthon</h1>
        <p className="text-muted-foreground">
          Est-ce qu'il pleuvait sur l'autoroute d'Arenthon le <strong>samedi 7 juin 2025 vers 9h05</strong> ?
        </p>
      </div>

      {/* Indicateur d'étapes */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Processus de vérification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStepIcon(1)}
              <span className={step >= 1 ? "font-medium" : "text-muted-foreground"}>1. Stations proches</span>
            </div>
            <div className="flex items-center gap-2">
              {getStepIcon(2)}
              <span className={step >= 2 ? "font-medium" : "text-muted-foreground"}>2. Commander données</span>
            </div>
            <div className="flex items-center gap-2">
              {getStepIcon(3)}
              <span className={step >= 3 ? "font-medium" : "text-muted-foreground"}>3. Télécharger</span>
            </div>
            <div className="flex items-center gap-2">
              {getStepIcon(4)}
              <span className={step >= 4 ? "font-medium" : "text-muted-foreground"}>4. Analyser pluie</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration API */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Token API Météo-France
          </CardTitle>
          <CardDescription>Saisissez votre token API généré depuis le portail Météo-France</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Token API</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Votre token API..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <Button onClick={searchStations} disabled={loading || !apiKey}>
            {loading && step === 1 ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Étape 1: Trouver les stations proches d'Arenthon
          </Button>
        </CardContent>
      </Card>

      {/* Stations trouvées */}
      {stations.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Stations météo proches de l'autoroute d'Arenthon
            </CardTitle>
            <CardDescription>{stations.length} station(s) trouvée(s) dans un rayon de 30km</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {stations.map((station) => (
                <div
                  key={station.id}
                  className={`p-3 border rounded cursor-pointer transition-colors ${
                    selectedStation?.id === station.id ? "bg-primary/10 border-primary" : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedStation(station)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{station.nom}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {station.id} | Distance: ~{station.distanceKm}km | Alt: {station.alt}m
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Coords: {station.lat.toFixed(4)}, {station.lon.toFixed(4)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline">{getTypePosteLabel(station.typePoste)}</Badge>
                      {station.posteOuvert && <Badge className="bg-green-100 text-green-800">Ouverte</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={commanderDonnees} disabled={loading || !selectedStation}>
              {loading && step === 2 ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Étape 2: Commander les données du 7 juin 2025 (9h-10h)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Commande créée */}
      {commandeId && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Commande créée
            </CardTitle>
            <CardDescription>
              Commande n° {commandeId} pour la station {selectedStation?.nom}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Badge className="bg-green-100 text-green-800">Commande acceptée</Badge>
            </div>
            <Button onClick={telechargerDonnees} disabled={loading}>
              {loading && step === 3 ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Étape 3: Télécharger et analyser les précipitations
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Résultat de l'analyse des précipitations */}
      {precipitationInfo && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Résultat: Précipitations le 7 juin 2025 vers 9h05
            </CardTitle>
            <CardDescription>
              Station: {selectedStation?.nom} (à ~{selectedStation?.distanceKm}km d'Arenthon)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{precipitationInfo}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Erreurs */}
      {error && (
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Données météo brutes */}
      {weatherData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Données météorologiques brutes (CSV)</CardTitle>
            <CardDescription>Fichier complet téléchargé de Météo-France</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea value={weatherData} readOnly className="min-h-[300px] font-mono text-sm" />
          </CardContent>
        </Card>
      )}

      {/* Réponse brute de l'API */}
      {rawResponse && (
        <Card>
          <CardHeader>
            <CardTitle>Réponse brute de l'API</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={rawResponse} readOnly className="min-h-[200px] font-mono text-sm" />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
