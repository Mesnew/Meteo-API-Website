"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  CloudRain,
  Home,
  MapPin,
  Calendar,
  Droplets,
  Thermometer,
  Wind,
  Gauge,
  CheckCircle,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// Base de données des villes avec des stations météo vérifiées
const villesFrancaises = {
  // Haute-Savoie (74) - Stations vérifiées
  Arenthon: { station: "74211002", nom: "PERS JUSSY", departement: "74" },
  Annemasse: { station: "74211002", nom: "PERS JUSSY (proche)", departement: "74" },
  Bonneville: { station: "74211002", nom: "PERS JUSSY (proche)", departement: "74" },
  Chamonix: { station: "74211002", nom: "PERS JUSSY (région)", departement: "74" },
  "Thonon-les-Bains": { station: "74211002", nom: "PERS JUSSY (région)", departement: "74" },

  // Utilisation de stations connues pour les grandes villes
  // Note: Ces stations sont des exemples - il faudrait vérifier les vraies stations
  Paris: { station: "75114001", nom: "PARIS (station exemple)", departement: "75" },
  Lyon: { station: "69123001", nom: "LYON (station exemple)", departement: "69" },
  Marseille: { station: "13055001", nom: "MARSEILLE (station exemple)", departement: "13" },

  // Pour l'instant, utilisons la station PERS JUSSY pour toutes les villes
  // jusqu'à ce qu'on trouve les bonnes stations
  Toulouse: { station: "74211002", nom: "PERS JUSSY (données test)", departement: "31" },
  Nice: { station: "74211002", nom: "PERS JUSSY (données test)", departement: "06" },
  Nantes: { station: "74211002", nom: "PERS JUSSY (données test)", departement: "44" },
  Strasbourg: { station: "74211002", nom: "PERS JUSSY (données test)", departement: "67" },
  Montpellier: { station: "74211002", nom: "PERS JUSSY (données test)", departement: "34" },
  Bordeaux: { station: "74211002", nom: "PERS JUSSY (données test)", departement: "33" },
  Lille: { station: "74211002", nom: "PERS JUSSY (données test)", departement: "59" },
  Rennes: { station: "74211002", nom: "PERS JUSSY (données test)", departement: "35" },
  Reims: { station: "74211002", nom: "PERS JUSSY (données test)", departement: "51" },
  "Le Havre": { station: "74211002", nom: "PERS JUSSY (données test)", departement: "76" },
  "Saint-Étienne": { station: "74211002", nom: "PERS JUSSY (données test)", departement: "42" },
  Toulon: { station: "74211002", nom: "PERS JUSSY (données test)", departement: "83" },
  Grenoble: { station: "74211002", nom: "PERS JUSSY (données test)", departement: "38" },
  Dijon: { station: "74211002", nom: "PERS JUSSY (données test)", departement: "21" },
  Angers: { station: "74211002", nom: "PERS JUSSY (données test)", departement: "49" },
  Nîmes: { station: "74211002", nom: "PERS JUSSY (données test)", departement: "30" },
  Villeurbanne: { station: "69266001", nom: "VILLEURBANNE", departement: "69" },
}

interface MeteoResult {
  ville: string
  date: string
  time: string
  station: string
  stationNom: string
  temperature?: number
  precipitation?: number
  humidity?: number
  windSpeed?: number
  pressure?: number
  conditions: string
  pleuvait: boolean
  dataSource: "api" | "unavailable"
}

export default function RechercheMeteo() {
  const [ville, setVille] = useState("Arenthon")
  const [date, setDate] = useState("2025-06-07")
  const [time, setTime] = useState("09:00")
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MeteoResult | null>(null)
  const [error, setError] = useState("")

  const rechercherMeteo = async () => {
    if (!apiKey) {
      setError("Veuillez saisir votre token API Météo-France")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const stationInfo = villesFrancaises[ville as keyof typeof villesFrancaises]

      if (!stationInfo) {
        throw new Error("Ville non trouvée dans la base de données")
      }

      // Étape 1: Commander les données
      const commandeResponse = await fetch("/api/meteo-france/commande", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          stationId: stationInfo.station,
          dateDebut: `${date}T${time}:00Z`,
          dateFin: `${date}T${time}:59Z`,
        }),
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
          apiKey,
          commandeId: commandeData.commandeId,
        }),
      })

      const downloadData = await downloadResponse.json()

      if (!downloadResponse.ok) {
        throw new Error(`Erreur téléchargement: ${downloadData.error}`)
      }

      if (downloadData.success && downloadData.status === "ready") {
        // Parser les données CSV
        const parsedData = parseCSVData(downloadData.data)

        const meteoResult: MeteoResult = {
          ville,
          date,
          time,
          station: stationInfo.station,
          stationNom: stationInfo.nom,
          temperature: parsedData?.temperature,
          precipitation: parsedData?.precipitation || 0,
          humidity: parsedData?.humidity,
          windSpeed: parsedData?.windSpeed,
          pressure: parsedData?.pressure,
          conditions: determinerConditions(parsedData?.precipitation || 0, parsedData?.temperature),
          pleuvait: (parsedData?.precipitation || 0) > 0,
          dataSource: "api",
        }

        setResult(meteoResult)
      } else {
        // Données non disponibles
        const meteoResult: MeteoResult = {
          ville,
          date,
          time,
          station: stationInfo.station,
          stationNom: stationInfo.nom,
          conditions: "Données non disponibles",
          pleuvait: false,
          dataSource: "unavailable",
        }

        setResult(meteoResult)
      }
    } catch (err) {
      setError(`Erreur: ${err instanceof Error ? err.message : "Erreur inconnue"}`)
    } finally {
      setLoading(false)
    }
  }

  const parseCSVData = (csvData: string) => {
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

  const determinerConditions = (precipitation: number, temperature?: number) => {
    if (precipitation > 5) return "Fortes précipitations"
    if (precipitation > 1) return "Précipitations modérées"
    if (precipitation > 0) return "Précipitations légères"
    if (temperature && temperature > 25) return "Temps chaud et sec"
    if (temperature && temperature < 5) return "Temps froid et sec"
    return "Temps sec"
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">🌦️ Recherche Météo France</h1>
          <p className="text-muted-foreground">Vérifiez les conditions météorologiques pour n'importe quelle ville</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Accueil
          </Link>
        </Button>
      </div>

      {/* Formulaire de recherche */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Recherche météorologique
          </CardTitle>
          <CardDescription>
            Sélectionnez une ville et une date pour connaître les conditions météo
            <br />
            <span className="text-amber-600 text-sm">
              ⚠️ Actuellement, seule la station PERS JUSSY (Arenthon) est vérifiée. Les autres villes utilisent cette
              station à titre de test.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Token API */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">Token API Météo-France</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Votre token API..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Ville */}
            <div className="space-y-2">
              <Label htmlFor="ville">Ville</Label>
              <Select value={ville} onValueChange={setVille}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une ville" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {Object.keys(villesFrancaises)
                    .sort()
                    .map((villeNom) => (
                      <SelectItem key={villeNom} value={villeNom}>
                        {villeNom} ({villesFrancaises[villeNom as keyof typeof villesFrancaises].departement})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            {/* Heure */}
            <div className="space-y-2">
              <Label htmlFor="time">Heure</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          {/* Informations sur la station */}
          {ville && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm font-medium mb-2">Station météo utilisée :</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Station:</span>
                  <br />
                  <span className="font-medium">{villesFrancaises[ville as keyof typeof villesFrancaises]?.nom}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">ID:</span>
                  <br />
                  <span className="font-mono">{villesFrancaises[ville as keyof typeof villesFrancaises]?.station}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Département:</span>
                  <br />
                  <span className="font-medium">
                    {villesFrancaises[ville as keyof typeof villesFrancaises]?.departement}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={rechercherMeteo} disabled={loading || !apiKey || !ville} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CloudRain className="mr-2 h-4 w-4" />}
            Rechercher les conditions météo
          </Button>
        </CardFooter>
      </Card>

      {/* Résultats */}
      {result && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.pleuvait ? (
                <Droplets className="h-5 w-5 text-blue-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              Résultat pour {result.ville}
            </CardTitle>
            <CardDescription>
              {result.date} à {result.time} - Station {result.stationNom}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Réponse principale */}
            <div className="text-center p-6 bg-muted rounded-lg mb-6">
              <div className="text-4xl font-bold mb-4">
                {result.pleuvait ? "🌧️ OUI, il pleuvait" : "☀️ NON, il ne pleuvait pas"}
              </div>
              <div className="text-xl mb-2">{result.conditions}</div>
              {result.dataSource === "api" && (
                <Badge className="bg-green-100 text-green-800">Données officielles Météo-France</Badge>
              )}
              {result.dataSource === "unavailable" && (
                <Badge variant="outline">Données non disponibles pour cette période</Badge>
              )}
            </div>

            {/* Détails météorologiques */}
            {result.dataSource === "api" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {result.precipitation !== undefined && (
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <Droplets className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">{result.precipitation.toFixed(1)} mm</div>
                    <div className="text-sm text-blue-600">Précipitations</div>
                  </div>
                )}

                {result.temperature !== undefined && (
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <Thermometer className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                    <div className="text-2xl font-bold">{result.temperature.toFixed(1)}°C</div>
                    <div className="text-sm text-orange-600">Température</div>
                  </div>
                )}

                {result.windSpeed !== undefined && (
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <Wind className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">{result.windSpeed} km/h</div>
                    <div className="text-sm text-green-600">Vent</div>
                  </div>
                )}

                {result.pressure !== undefined && (
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <Gauge className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                    <div className="text-2xl font-bold">{result.pressure.toFixed(0)} hPa</div>
                    <div className="text-sm text-purple-600">Pression</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Erreurs */}
      {error && (
        <Alert className="mb-6">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Comment utiliser
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>1. Saisissez votre token API Météo-France</p>
          <p>2. Sélectionnez une ville dans la liste (principales villes françaises disponibles)</p>
          <p>3. Choisissez la date et l'heure qui vous intéressent</p>
          <p>4. Cliquez sur "Rechercher les conditions météo"</p>
          <p className="text-muted-foreground mt-4">
            Note: Les données sont récupérées directement depuis l'API officielle de Météo-France
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
