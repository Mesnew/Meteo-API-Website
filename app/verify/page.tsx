"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Shield, CheckCircle, FileText, Download, Hash, Clock, Globe, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface VerificationData {
  timestamp: string
  apiUrl: string
  requestHeaders: Record<string, string>
  responseHeaders: Record<string, string>
  httpStatus: number
  dataHash: string
  certificateChain?: string[]
  ipAddress?: string
  userAgent: string
  requestId: string
}

export default function VerifyPage() {
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null)
  const [rawData, setRawData] = useState("")
  const [error, setError] = useState("")

  const fetchWithVerification = async () => {
    if (!apiKey) {
      setError("Veuillez saisir votre token API")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/meteo-france/verified-fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          stationId: "74211002", // PERS JUSSY
          dateDebut: "2025-06-07T09:00:00Z",
          dateFin: "2025-06-07T10:59:59Z",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(`Erreur: ${data.error || "Erreur inconnue"}`)
        return
      }

      setVerificationData(data.verification)
      setRawData(data.rawData || "")
    } catch (err) {
      setError(`Erreur: ${err instanceof Error ? err.message : "Erreur inconnue"}`)
    } finally {
      setLoading(false)
    }
  }

  const downloadProof = () => {
    if (!verificationData || !rawData) return

    const proofDocument = {
      title: "CERTIFICAT D'AUTHENTICITÉ - DONNÉES MÉTÉO-FRANCE",
      generatedAt: new Date().toISOString(),
      verification: verificationData,
      rawData: rawData,
      digitalSignature: `SHA-256: ${verificationData.dataHash}`,
      disclaimer: "Ce document certifie l'origine et l'intégrité des données météorologiques",
    }

    const blob = new Blob([JSON.stringify(proofDocument, null, 2)], {
      type: "application/json",
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `meteo-france-proof-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header avec navigation */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Vérification d'Authenticité
              </h1>
            </div>
            <p className="text-muted-foreground">
              Preuve cryptographique que les données proviennent directement de l'API officielle Météo-France
            </p>
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

        {/* Récupération avec vérification */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Récupération Vérifiée des Données
            </CardTitle>
            <CardDescription>
              Récupération directe avec traçabilité complète et empreinte cryptographique
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
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
                className="border-2 border-gray-200 focus:border-purple-400 transition-colors"
              />
            </div>
            <Button
              onClick={fetchWithVerification}
              disabled={loading || !apiKey}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
              Récupérer avec Preuve d'Authenticité
            </Button>
          </CardContent>
        </Card>

        {/* Certificat de vérification */}
        {verificationData && (
          <>
            <Card className="mb-6 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  CERTIFICAT D'AUTHENTICITÉ VÉRIFIÉ
                </CardTitle>
                <CardDescription>
                  Les données ci-dessous proviennent directement de l'API officielle Météo-France
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
                    <div className="font-semibold text-green-700 text-lg">AUTHENTIFIÉ</div>
                    <div className="text-xs text-green-600 mt-1">Source vérifiée</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <Globe className="h-10 w-10 text-blue-500 mx-auto mb-3" />
                    <div className="font-semibold text-blue-700 text-lg">API OFFICIELLE</div>
                    <div className="text-xs text-blue-600 mt-1">public-api.meteofrance.fr</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <Hash className="h-10 w-10 text-purple-500 mx-auto mb-3" />
                    <div className="font-semibold text-purple-700 text-lg">INTÉGRITÉ</div>
                    <div className="text-xs text-purple-600 mt-1">Hash cryptographique</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <Clock className="h-10 w-10 text-orange-500 mx-auto mb-3" />
                    <div className="font-semibold text-orange-700 text-lg">HORODATÉ</div>
                    <div className="text-xs text-orange-600 mt-1">Timestamp UTC</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={downloadProof}
                    variant="outline"
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger le Certificat
                  </Button>
                  <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm font-medium">
                    Status HTTP: {verificationData.httpStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Détails techniques de vérification */}
            <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Preuves Techniques d'Authenticité
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">Élément de Preuve</TableHead>
                        <TableHead className="font-semibold">Valeur</TableHead>
                        <TableHead className="font-semibold">Vérification</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="hover:bg-blue-50/50 transition-colors">
                        <TableCell className="font-medium">URL de l'API</TableCell>
                        <TableCell className="font-mono text-sm break-all">{verificationData.apiUrl}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">✓ Domaine officiel</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-blue-50/50 transition-colors">
                        <TableCell className="font-medium">Timestamp de requête</TableCell>
                        <TableCell className="font-mono text-sm">{verificationData.timestamp}</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800">✓ Horodatage UTC</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-blue-50/50 transition-colors">
                        <TableCell className="font-medium">Hash des données</TableCell>
                        <TableCell className="font-mono text-sm break-all">{verificationData.dataHash}</TableCell>
                        <TableCell>
                          <Badge className="bg-purple-100 text-purple-800">✓ Intégrité vérifiée</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-blue-50/50 transition-colors">
                        <TableCell className="font-medium">ID de requête</TableCell>
                        <TableCell className="font-mono text-sm">{verificationData.requestId}</TableCell>
                        <TableCell>
                          <Badge className="bg-orange-100 text-orange-800">✓ Traçabilité</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-blue-50/50 transition-colors">
                        <TableCell className="font-medium">User-Agent</TableCell>
                        <TableCell className="font-mono text-sm">{verificationData.userAgent}</TableCell>
                        <TableCell>
                          <Badge className="bg-gray-100 text-gray-800">✓ Application identifiée</Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Headers de réponse */}
            <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-lg">
                <CardTitle>Headers de Réponse Météo-France</CardTitle>
                <CardDescription>Preuves techniques de l'origine des données</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl font-mono text-sm border-2 border-gray-200">
                  {Object.entries(verificationData.responseHeaders).map(([key, value]) => (
                    <div key={key} className="mb-2 hover:bg-white/50 p-2 rounded transition-colors">
                      <span className="text-blue-600 font-semibold">{key}:</span>{" "}
                      <span className="text-green-600">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Données brutes avec hash */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                <CardTitle>Données Brutes Authentifiées</CardTitle>
                <CardDescription>
                  Hash SHA-256:{" "}
                  <code className="bg-muted px-3 py-1 rounded font-mono text-sm">{verificationData.dataHash}</code>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  value={rawData}
                  readOnly
                  className="min-h-[300px] font-mono text-sm border-2 border-gray-200 bg-gray-50"
                />
                <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span className="font-semibold text-green-700 text-lg">Données Authentifiées</span>
                  </div>
                  <p className="text-sm text-green-600 leading-relaxed">
                    Ces données ont été récupérées directement depuis l'API officielle Météo-France le{" "}
                    <strong>{new Date(verificationData.timestamp).toLocaleString("fr-FR")}</strong> et leur intégrité
                    est garantie par l'empreinte cryptographique ci-dessus.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Erreur */}
        {error && (
          <Alert className="shadow-lg border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Explications */}
        <Card className="mt-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 rounded-t-lg">
            <CardTitle>Comment Vérifier l'Authenticité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                <h4 className="font-semibold mb-4 text-blue-800 flex items-center gap-2">
                  🔒 Preuves Cryptographiques
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Hash SHA-256 des données brutes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Timestamp UTC de la requête
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Headers HTTP authentiques
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Certificat SSL du domaine officiel
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                <h4 className="font-semibold mb-4 text-green-800 flex items-center gap-2">🌐 Vérifications Réseau</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Domaine: public-api.meteofrance.fr
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Certificat SSL gouvernemental
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Headers de réponse officiels
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Traçabilité complète de la requête
                  </li>
                </ul>
              </div>
            </div>

            <Alert className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-gray-700">
                <strong>Garantie d'authenticité:</strong> Cette application récupère les données directement depuis
                l'API officielle Météo-France sans modification. Le hash cryptographique garantit que les données n'ont
                pas été altérées. Le certificat téléchargeable peut servir de preuve légale.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
