"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, TestTube } from "lucide-react"

export default function TestApiPage() {
  const [apiKey, setApiKey] = useState("")
  const [customUrl, setCustomUrl] = useState("https://portail-api.meteofrance.fr/public/DPClim/v1/liste-stations")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")
  const [error, setError] = useState("")

  const testDirectApi = async () => {
    if (!apiKey) {
      setError("Veuillez saisir votre clé API")
      return
    }

    setLoading(true)
    setError("")
    setResult("")

    try {
      const response = await fetch("/api/test-direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          url: customUrl,
        }),
      })

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))

      if (!response.ok) {
        setError(`Erreur ${response.status}: ${data.error || "Erreur inconnue"}`)
      }
    } catch (err) {
      setError(`Erreur: ${err instanceof Error ? err.message : "Erreur inconnue"}`)
    } finally {
      setLoading(false)
    }
  }

  const commonUrls = [
    "https://portail-api.meteofrance.fr/public/DPClim/v1/liste-stations",
    "https://portail-api.meteofrance.fr/public/DonneesPubliquesClimatologie/v1/liste-stations",
    "https://portail-api.meteofrance.fr/web/services/DPClim/liste-stations",
    "https://api.meteofrance.fr/public/DPClim/v1/liste-stations",
  ]

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test API Météo-France</h1>
        <p className="text-muted-foreground">Testez directement votre clé API avec différentes URLs</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test direct de l'API
          </CardTitle>
          <CardDescription>Testez votre clé API avec une URL personnalisée</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testApiKey">Clé API Météo-France</Label>
            <Input
              id="testApiKey"
              type="password"
              placeholder="Votre clé API..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customUrl">URL de l'API à tester</Label>
            <Input
              id="customUrl"
              placeholder="URL de l'API..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>URLs communes à tester :</Label>
            <div className="grid gap-2">
              {commonUrls.map((url, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setCustomUrl(url)}
                  className="justify-start text-left h-auto p-2"
                >
                  <span className="text-xs font-mono">{url}</span>
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={testDirectApi} disabled={loading || !apiKey}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Tester l'API
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Résultat du test</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={result} readOnly className="min-h-[300px] font-mono text-sm" />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
