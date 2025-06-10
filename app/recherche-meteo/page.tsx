"use client"

import { useState, useEffect } from "react"
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
  Search,
  Info,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Base de données simplifiée des villes françaises pour l'autocomplétion
const villesFrancaises = [
  // Île-de-France
  "Paris (75)",

  // Provence-Alpes-Côte d'Azur
  "Marseille (13)",
  "Nice (06)",
  "Toulon (83)",
  "Aix-en-Provence (13)",
  "Avignon (84)",

  // Auvergne-Rhône-Alpes
  "Lyon (69)",
  "Grenoble (38)",
  "Saint-Étienne (42)",
  "Villeurbanne (69)",
  "Clermont-Ferrand (63)",
  "Annecy (74)",
  "Arenthon (74)",
  "Annemasse (74)",
  "Bonneville (74)",
  "Chamonix (74)",
  "Thonon-les-Bains (74)",
  "Chambéry (73)",

  // Occitanie
  "Toulouse (31)",
  "Montpellier (34)",
  "Nîmes (30)",
  "Perpignan (66)",

  // Nouvelle-Aquitaine
  "Bordeaux (33)",
  "Limoges (87)",
  "La Rochelle (17)",

  // Pays de la Loire
  "Nantes (44)",
  "Angers (49)",
  "Le Mans (72)",

  // Grand Est
  "Strasbourg (67)",
  "Reims (51)",
  "Metz (57)",
  "Mulhouse (68)",
  "Nancy (54)",
  "Troyes (10)",

  // Hauts-de-France
  "Lille (59)",
  "Amiens (80)",

  // Bretagne
  "Rennes (35)",
  "Brest (29)",

  // Normandie
  "Le Havre (76)",
  "Rouen (76)",
  "Caen (14)",

  // Bourgogne-Franche-Comté
  "Dijon (21)",
  "Besançon (25)",

  // Centre-Val de Loire
  "Orléans (45)",
  "Tours (37)",
  "Poitiers (86)",
]

interface Station {
  id: string
  nom: string
  lat: number
  lon: number
  altitude: number
  distance: number
  distanceKm: number
  departement?: string
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
  const [filteredVilles, setFilteredVilles] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [date, setDate] = useState("2025-06-07")
  const [time, setTime] = useState("09:00")
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingStations, setLoadingStations] = useState(false)
  const [stations, setStations] = useState<Station[]>([])
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [result, setResult] = useState<MeteoResult | null>(null)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("recherche")

  // Filtrer les villes en fonction de la recherche
  useEffect(() => {
    if (searchTerm.length > 1) {
      const filtered = villesFrancaises.filter((v) => v.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 10)
      setFilteredVilles(filtered)
    } else {
      setFilteredVilles([])
    }
  }, [searchTerm])

  // Rechercher les stations proches de la ville sélectionnée
  const rechercherStations = async () => {
    if (!apiKey) {
      setError("Veuillez saisir votre token API Météo-France")
      return
    }

    if (!ville) {
      setError("Veuillez sélectionner une ville")
      return
    }

    setLoadingStations(true)
    setError("")
    setStations([])
    setSelectedStation(null)

    try {
      // Extraire le nom de la ville sans le département
      const villeNom = ville.includes("(") ? ville.split(" (")[0] : ville
      const departementMatch = ville.match(/$$(\d{2,3})$$/)
      const departement = departementMatch ? departementMatch[1] : null

      const response = await fetch("/api/meteo-france/stations-proximite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          ville: villeNom,
          departement,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(`Erreur: ${data.error || "Erreur inconnue"}`)
      }

      if (data.stations && data.stations.length > 0) {
        setStations(data.stations)
        setSelectedStation(data.stations[0]) // Sélectionner la station la plus proche par défaut
        setActiveTab("stations")
      } else {
        setError("Aucune station météo trouvée à proximité de cette ville")
      }
    } catch (err) {
      setError(`Erreur: ${err instanceof Error ? err.message : "Erreur inconnue"}`)
    } finally {
      setLoadingStations(false)
    }
  }

  // Rechercher les données météo pour la station sélectionnée
  const rechercherMeteo = async () => {
    if (!apiKey) {
      setError("Veuillez saisir votre token API Météo-France")
      return
    }

    if (!selectedStation) {
      setError("Veuillez d'abord rechercher et sélectionner une station météo")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)

    try {
      // Étape 1: Commander les données
      const commandeResponse = await fetch("/api/meteo-france/commande", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          stationId: selectedStation.id,
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
          station: selectedStation.id,
          stationNom: selectedStation.nom,
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
        setActiveTab("resultats")
      } else {
        // Données non disponibles
        const meteoResult: MeteoResult = {
          ville,
          date,
          time,
          station: selectedStation.id,
          stationNom: selectedStation.nom,
          conditions: "Données non disponibles",
          pleuvait: false,
          dataSource: "unavailable",
        }

        setResult(meteoResult)
        setActiveTab("resultats")
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header avec navigation */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Recherche Météo France
              </h1>
            </div>
            <p className="text-muted-foreground">Vérifiez les conditions météorologiques pour n'importe quelle ville</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild className="shadow-sm hover:shadow-md transition-shadow">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Link>
            </Button>
            <Button variant="outline" asChild className="shadow-sm hover:shadow-md transition-shadow">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Accueil
              </Link>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm shadow-sm">
            <TabsTrigger value="recherche" className="data-[state=active]:bg-blue-100">
              Recherche
            </TabsTrigger>
            <TabsTrigger value="stations" className="data-[state=active]:bg-green-100">
              Stations ({stations.length})
            </TabsTrigger>
            <TabsTrigger value="resultats" disabled={!result} className="data-[state=active]:bg-purple-100">
              Résultats
            </TabsTrigger>
          </TabsList>

          {/* Onglet de recherche */}
          <TabsContent value="recherche">
            <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  Recherche de ville
                </CardTitle>
                <CardDescription>
                  Saisissez votre token API et recherchez n'importe quelle ville en France
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {/* Token API */}
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="text-sm font-medium">
                    Token API Météo-France
                  </Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Votre token API..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="border-2 border-gray-200 focus:border-blue-400 transition-colors"
                  />
                </div>

                {/* Recherche de ville */}
                <div className="space-y-2">
                  <Label htmlFor="villeSearch" className="text-sm font-medium">
                    Ville
                  </Label>
                  <div className="relative">
                    <Input
                      id="villeSearch"
                      type="text"
                      placeholder="Rechercher une ville..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-2 border-gray-200 focus:border-blue-400 transition-colors"
                    />
                    {filteredVilles.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border-2 border-blue-200 rounded-lg shadow-xl max-h-60 overflow-auto">
                        {filteredVilles.map((v) => (
                          <div
                            key={v}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                            onClick={() => {
                              setVille(v)
                              setSearchTerm(v)
                              setFilteredVilles([])
                            }}
                          >
                            {v}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date */}
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium">
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="border-2 border-gray-200 focus:border-blue-400 transition-colors"
                    />
                  </div>

                  {/* Heure */}
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-sm font-medium">
                      Heure
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="border-2 border-gray-200 focus:border-blue-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Ville sélectionnée */}
                {ville && (
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      <span className="font-medium text-blue-800">Ville sélectionnée: {ville}</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      Recherche optimisée dans le département {ville.match(/$$(\d{2,3})$$/)?.[1] || "spécifié"}.
                      <br />
                      Cliquez sur "Rechercher les stations" pour trouver les stations météo les plus proches.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={rechercherStations}
                  disabled={loadingStations || !apiKey || !ville}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loadingStations ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="mr-2 h-4 w-4" />
                  )}
                  Rechercher les stations météo proches
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Onglet des stations */}
          <TabsContent value="stations">
            <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  Stations météo proches de {ville}
                </CardTitle>
                <CardDescription>Sélectionnez une station pour consulter les données météorologiques</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {stations.length > 0 ? (
                  <div className="space-y-6">
                    {/* Carte des stations (simulée) */}
                    <div className="bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-xl border-2 border-blue-200 text-center">
                      <div className="text-sm text-muted-foreground mb-3">
                        Carte des stations météo proches de {ville}
                      </div>
                      <div className="h-40 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center shadow-inner">
                        <MapPin className="h-8 w-8 text-blue-500 mr-3" />
                        <span className="text-lg font-medium text-blue-700">{stations.length} stations trouvées</span>
                      </div>
                    </div>

                    {/* Liste des stations */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Sélectionnez une station</Label>
                      <div className="grid gap-3">
                        {stations.map((station) => (
                          <div
                            key={station.id}
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                              selectedStation?.id === station.id
                                ? "bg-gradient-to-r from-blue-100 to-green-100 border-blue-300 shadow-md"
                                : "hover:bg-gray-50 border-gray-200 hover:border-blue-200 hover:shadow-sm"
                            }`}
                            onClick={() => setSelectedStation(station)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-gray-800">{station.nom}</div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {station.id} | Altitude: {station.altitude}m
                                </div>
                              </div>
                              <Badge className="bg-green-100 text-green-800 font-medium px-3 py-1">
                                {station.distanceKm} km
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Station sélectionnée */}
                    {selectedStation && (
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200">
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="font-medium text-green-800">
                            Station sélectionnée: {selectedStation.nom}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="bg-white/80 p-3 rounded-lg">
                            <span className="text-muted-foreground">ID:</span>
                            <br />
                            <span className="font-mono font-medium">{selectedStation.id}</span>
                          </div>
                          <div className="bg-white/80 p-3 rounded-lg">
                            <span className="text-muted-foreground">Distance:</span>
                            <br />
                            <span className="font-medium text-green-600">{selectedStation.distanceKm} km</span>
                          </div>
                          <div className="bg-white/80 p-3 rounded-lg">
                            <span className="text-muted-foreground">Latitude:</span>
                            <br />
                            <span className="font-medium">{selectedStation.lat.toFixed(4)}</span>
                          </div>
                          <div className="bg-white/80 p-3 rounded-lg">
                            <span className="text-muted-foreground">Longitude:</span>
                            <br />
                            <span className="font-medium">{selectedStation.lon.toFixed(4)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <Info className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Aucune station trouvée</p>
                    <p className="text-sm text-muted-foreground">
                      Veuillez d'abord rechercher une ville pour voir les stations météo à proximité
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("recherche")}
                  className="shadow-sm hover:shadow-md transition-shadow"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la recherche
                </Button>
                <Button
                  onClick={rechercherMeteo}
                  disabled={loading || !selectedStation}
                  className="ml-auto bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CloudRain className="mr-2 h-4 w-4" />}
                  Consulter la météo
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Onglet des résultats */}
          <TabsContent value="resultats">
            {result && (
              <Card className="mb-6 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    {result.pleuvait ? (
                      <Droplets className="h-6 w-6 text-blue-500" />
                    ) : (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    )}
                    Résultat pour {result.ville}
                  </CardTitle>
                  <CardDescription>
                    {result.date} à {result.time} - Station {result.stationNom} ({result.station})
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Réponse principale */}
                  <div className="text-center p-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl mb-6 border-2 border-green-200">
                    <div className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      {result.pleuvait ? "🌧️ OUI, il pleuvait" : "☀️ NON, il ne pleuvait pas"}
                    </div>
                    <div className="text-xl mb-4 text-gray-700">{result.conditions}</div>
                    {result.dataSource === "api" && (
                      <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm font-medium">
                        Données officielles Météo-France
                      </Badge>
                    )}
                    {result.dataSource === "unavailable" && (
                      <Badge variant="outline" className="px-4 py-2 text-sm">
                        Données non disponibles pour cette période
                      </Badge>
                    )}
                  </div>

                  {/* Détails météorologiques */}
                  {result.dataSource === "api" && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {result.precipitation !== undefined && (
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center shadow-sm hover:shadow-md transition-shadow">
                          <Droplets className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                          <div className="text-3xl font-bold text-blue-600 mb-1">
                            {result.precipitation.toFixed(1)} mm
                          </div>
                          <div className="text-sm text-blue-600 font-medium">Précipitations</div>
                        </div>
                      )}

                      {result.temperature !== undefined && (
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl text-center shadow-sm hover:shadow-md transition-shadow">
                          <Thermometer className="h-8 w-8 mx-auto mb-3 text-orange-500" />
                          <div className="text-3xl font-bold text-orange-600 mb-1">
                            {result.temperature.toFixed(1)}°C
                          </div>
                          <div className="text-sm text-orange-600 font-medium">Température</div>
                        </div>
                      )}

                      {result.windSpeed !== undefined && (
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl text-center shadow-sm hover:shadow-md transition-shadow">
                          <Wind className="h-8 w-8 mx-auto mb-3 text-green-500" />
                          <div className="text-3xl font-bold text-green-600 mb-1">{result.windSpeed} km/h</div>
                          <div className="text-sm text-green-600 font-medium">Vent</div>
                        </div>
                      )}

                      {result.pressure !== undefined && (
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl text-center shadow-sm hover:shadow-md transition-shadow">
                          <Gauge className="h-8 w-8 mx-auto mb-3 text-purple-500" />
                          <div className="text-3xl font-bold text-purple-600 mb-1">
                            {result.pressure.toFixed(0)} hPa
                          </div>
                          <div className="text-sm text-purple-600 font-medium">Pression</div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("stations")}
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour aux stations
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("recherche")}
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    Nouvelle recherche
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Erreurs */}
        {error && (
          <Alert className="mb-6 shadow-lg border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Comment utiliser
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  Saisissez votre token API Météo-France
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  Recherchez n'importe quelle ville en France
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  Sélectionnez la date et l'heure qui vous intéressent
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  Trouvez les stations météo les plus proches de cette ville
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                    5
                  </span>
                  Sélectionnez une station et consultez les données météo
                </p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
              <p className="text-muted-foreground text-center">
                <strong>Note:</strong> Les données sont récupérées directement depuis l'API officielle de Météo-France
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
