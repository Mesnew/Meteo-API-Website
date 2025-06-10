"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface ExploreResult {
  endpoint: string
  status: number
  statusText: string
  contentType: string
  isJson: boolean
  isHtml: boolean
  success: boolean
  dataPreview: string
  error?: string
}

export default function ExplorePage() {
  const [apiKey, setApiKey] = useState("")
  const [baseUrl, setBaseUrl] = useState("https://portail-api.meteofrance.fr/public")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ExploreResult[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [error, setError] = useState("")

  const commonBaseUrls = [
    "https://portail-api.meteofrance.fr/public",
    "https://portail-api.meteofrance.fr/public/DPClim",
    "https://portail-api.meteofrance.fr/public/DonneesPubliquesClimatologie",
    "https://api.meteofrance.fr/public",
    "https://webservice.meteofrance.com/public",
  ]

  const exploreApi = async () => {
    if (!apiKey) {
      setError("Veuillez saisir votre clé API")
      return
    }

    setLoading(true)
    setError("")
    setResults([])

    try {
      const response = await fetch("/api/explore-api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          baseUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(`Erreur ${response.status}: ${data.error || "Erreur inconnue"}`)
        return
      }

      setResults(data.results || [])
      setSummary(data.summary || null)
    } catch (err) {
      setError(`Erreur: ${err instanceof Error ? err.message : "Erreur inconnue"}`)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (result: ExploreResult) => {
    if (result.success) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (result.isHtml) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (result: ExploreResult) => {
    if (result.success) return <Badge className="bg-green-100 text-green-800">Succès</Badge>
    if (result.isHtml) return <Badge className="bg-yellow-100 text-yellow-800">Page HTML</Badge>
    if (result.error) return <Badge className="bg-red-100 text-red-800">Erreur</Badge>
    return <Badge className="bg-gray-100 text-gray-800">{result.status}</Badge>
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explorateur API Météo-France</h1>
        <p className="text-muted-foreground">Trouvez les bonnes URLs de l'API en testant différents endpoints</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Configuration de l'exploration
          </CardTitle>
          <CardDescription>Configurez les paramètres pour explorer l'API Météo-France</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exploreApiKey">Clé API Météo-France</Label>
            <Input
              id="exploreApiKey"
              type="password"
              placeholder="Votre clé API..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseUrl">URL de base à explorer</Label>
            <Input
              id="baseUrl"
              placeholder="URL de base..."
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>URLs de base communes :</Label>
            <div className="grid gap-2">
              {commonBaseUrls.map((url, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setBaseUrl(url)}
                  className="justify-start text-left h-auto p-2"
                >
                  <span className="text-xs font-mono">{url}</span>
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={exploreApi} disabled={loading || !apiKey}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Explorer l'API
          </Button>
        </CardContent>
      </Card>

      {summary && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Résumé de l'exploration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{summary.total}</div>
                <div className="text-sm text-muted-foreground">Endpoints testés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary.successful}</div>
                <div className="text-sm text-muted-foreground">Succès</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{summary.htmlResponses}</div>
                <div className="text-sm text-muted-foreground">Pages HTML</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{summary.errors}</div>
                <div className="text-sm text-muted-foreground">Erreurs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Résultats de l'exploration</h2>
          {results.map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result)}
                    <span className="font-mono text-sm">{result.endpoint}</span>
                  </div>
                  {getStatusBadge(result)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium mb-1">Status:</div>
                    <div className="text-sm">
                      {result.status} {result.statusText}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Content-Type:</div>
                    <div className="text-sm">{result.contentType}</div>
                  </div>
                </div>

                {result.success && (
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-1">Aperçu des données:</div>
                    <div className="bg-muted p-2 rounded text-xs font-mono">{result.dataPreview}</div>
                  </div>
                )}

                {result.error && (
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-1 text-red-600">Erreur:</div>
                    <div className="text-sm text-red-600">{result.error}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>1. Saisissez votre clé API Météo-France</p>
          <p>2. Choisissez une URL de base ou utilisez une des URLs communes</p>
          <p>3. Cliquez sur "Explorer l'API" pour tester différents endpoints</p>
          <p>4. Recherchez les endpoints marqués comme "Succès" (badge vert)</p>
          <p className="text-muted-foreground">
            Note: Les endpoints qui retournent des "Pages HTML" indiquent des URLs incorrectes
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
