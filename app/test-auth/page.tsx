"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, TestTube } from "lucide-react"

export default function TestAuthPage() {
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState("")

  const testAuthentication = async () => {
    if (!apiKey) {
      setError("Veuillez saisir votre token API")
      return
    }

    setLoading(true)
    setError("")
    setResults([])

    const authMethods = [
      {
        name: "apikey header",
        headers: { apikey: apiKey, Accept: "application/json" },
      },
      {
        name: "Authorization Bearer",
        headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
      },
      {
        name: "Authorization Basic",
        headers: { Authorization: `Basic ${btoa(apiKey + ":")}`, Accept: "application/json" },
      },
      {
        name: "X-API-Key header",
        headers: { "X-API-Key": apiKey, Accept: "application/json" },
      },
      {
        name: "Ocp-Apim-Subscription-Key",
        headers: { "Ocp-Apim-Subscription-Key": apiKey, Accept: "application/json" },
      },
    ]

    const testUrl = "https://public-api.meteofrance.fr/public/DPClim/v1/liste-stations/horaire?id-departement=74"

    for (const method of authMethods) {
      try {
        console.log(`Test avec ${method.name}`)

        const response = await fetch("/api/test-auth-method", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: testUrl,
            headers: method.headers,
            methodName: method.name,
          }),
        })

        const data = await response.json()

        setResults((prev) => [
          ...prev,
          {
            method: method.name,
            status: data.status,
            success: data.success,
            error: data.error,
            headers: method.headers,
            response: data.response,
          },
        ])
      } catch (err) {
        setResults((prev) => [
          ...prev,
          {
            method: method.name,
            status: "Error",
            success: false,
            error: err instanceof Error ? err.message : "Erreur inconnue",
            headers: method.headers,
          },
        ])
      }
    }

    setLoading(false)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test d'authentification API</h1>
        <p className="text-muted-foreground">Testez différentes méthodes d'authentification avec votre token</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test des méthodes d'authentification
          </CardTitle>
          <CardDescription>Nous allons tester 5 méthodes d'authentification différentes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testApiKey">Token API Météo-France</Label>
            <Input
              id="testApiKey"
              type="password"
              placeholder="Votre token API..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <Button onClick={testAuthentication} disabled={loading || !apiKey}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Tester toutes les méthodes d'authentification
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Résultats des tests</h2>
          {results.map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{result.method}</span>
                  <Badge className={result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {result.success ? "Succès" : `Échec (${result.status})`}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>Headers utilisés:</strong>
                    <pre className="bg-muted p-2 rounded text-xs mt-1">{JSON.stringify(result.headers, null, 2)}</pre>
                  </div>
                  {result.error && (
                    <div>
                      <strong className="text-red-600">Erreur:</strong>
                      <p className="text-red-600 text-sm">{result.error}</p>
                    </div>
                  )}
                  {result.response && (
                    <div>
                      <strong>Réponse (aperçu):</strong>
                      <Textarea
                        value={JSON.stringify(result.response, null, 2).substring(0, 500) + "..."}
                        readOnly
                        className="mt-1 h-32 text-xs font-mono"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Méthodes testées</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            1. <strong>apikey header</strong> - Header "apikey" (format standard Météo-France)
          </p>
          <p>
            2. <strong>Authorization Bearer</strong> - Header "Authorization: Bearer token"
          </p>
          <p>
            3. <strong>Authorization Basic</strong> - Header "Authorization: Basic" avec token encodé
          </p>
          <p>
            4. <strong>X-API-Key header</strong> - Header "X-API-Key" (format Azure/AWS)
          </p>
          <p>
            5. <strong>Ocp-Apim-Subscription-Key</strong> - Header Azure API Management
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
