"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  CloudRain,
  FileSearch,
  Shield,
  ArrowRight,
  CheckCircle,
  FileText,
  Search,
  MapPin,
  Calendar,
  Cloud,
} from "lucide-react"

export default function HomePage() {
  const quickStats = [
    { label: "Station utilisée", value: "PERS JUSSY", icon: <MapPin className="h-4 w-4" /> },
    { label: "Distance d'Arenthon", value: "~5km", icon: <MapPin className="h-4 w-4" /> },
    { label: "Date analysée", value: "7 juin 2025", icon: <Calendar className="h-4 w-4" /> },
    { label: "Heure précise", value: "9h05 UTC", icon: <Calendar className="h-4 w-4" /> },
  ]

  const navigationCards = [
    {
      href: "/recherche-meteo",
      icon: <Search className="h-6 w-6" />,
      badge: { text: "Nouveau", color: "bg-green-100 text-green-800" },
      title: "🌦️ Recherche Météo France",
      description: "Recherchez les conditions météo pour n'importe quelle ville de France",
      features: [
        { text: "Toutes les villes", icon: <CheckCircle className="h-3 w-3 text-green-500" /> },
        { text: "N'importe quelle date", icon: <CheckCircle className="h-3 w-3 text-green-500" /> },
        { text: "Données officielles", icon: <CheckCircle className="h-3 w-3 text-green-500" /> },
        { text: "Stations les plus proches", icon: <CheckCircle className="h-3 w-3 text-green-500" /> },
      ],
      buttonText: "Accéder",
      buttonVariant: "default" as const,
    },
    {
      href: "/meteo",
      icon: <CloudRain className="h-6 w-6" />,
      badge: { text: "Cas spécifique", color: "bg-blue-100 text-blue-800" },
      title: "🌧️ Météo Arenthon",
      description: "Cas spécifique : Arenthon le 7 juin 2025 vers 9h05",
      features: [
        { text: "Stations proches", icon: <CheckCircle className="h-3 w-3 text-green-500" /> },
        { text: "Données horaires", icon: <CheckCircle className="h-3 w-3 text-green-500" /> },
        { text: "Analyse automatique", icon: <CheckCircle className="h-3 w-3 text-green-500" /> },
        { text: "Résultat clair", icon: <CheckCircle className="h-3 w-3 text-green-500" /> },
      ],
      buttonText: "Accéder",
      buttonVariant: "outline" as const,
    },
    {
      href: "/analyze",
      icon: <FileSearch className="h-6 w-6" />,
      badge: { text: "Preuve Détaillée", color: "bg-blue-100 text-blue-800" },
      title: "🔬 Analyse Scientifique",
      description: "Preuve concrète avec analyse détaillée des données CSV officielles",
      features: [
        { text: "Données CSV brutes", icon: <CheckCircle className="h-3 w-3 text-green-500" /> },
        { text: "Tableaux détaillés", icon: <CheckCircle className="h-3 w-3 text-green-500" /> },
        { text: "Calculs scientifiques", icon: <CheckCircle className="h-3 w-3 text-green-500" /> },
        { text: "Méthodologie", icon: <CheckCircle className="h-3 w-3 text-green-500" /> },
      ],
      buttonText: "Accéder",
      buttonVariant: "outline" as const,
    },
    {
      href: "/verify",
      icon: <Shield className="h-6 w-6" />,
      badge: { text: "Certification", color: "bg-purple-100 text-purple-800" },
      title: "🔐 Vérification d'Authenticité",
      description: "Preuve cryptographique que les données proviennent de Météo-France",
      features: [
        { text: "Hash cryptographique", icon: <CheckCircle className="h-3 w-3 text-green-500" /> },
        { text: "Headers officiels", icon: <CheckCircle className="h-3 w-3 text-green-500" /> },
        { text: "Certificat SSL", icon: <CheckCircle className="h-3 w-3 text-green-500" /> },
        { text: "Traçabilité", icon: <CheckCircle className="h-3 w-3 text-green-500" /> },
      ],
      buttonText: "Accéder",
      buttonVariant: "outline" as const,
    },
  ]

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Cloud className="h-12 w-12 text-blue-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Météo-France API Helper
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-6">
              Récupération et analyse des données météorologiques officielles
            </p>
            <div className="flex items-center justify-center gap-2 mb-8">
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Données Officielles
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                <Shield className="h-3 w-3 mr-1" />
                Authentifié
              </Badge>
              <Badge className="bg-purple-100 text-purple-800">
                <FileText className="h-3 w-3 mr-1" />
                Certifié
              </Badge>
            </div>
          </div>

          {/* Question principale */}
          <Card className="mb-12 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-green-50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-blue-700">
                🌦️ Consultez la météo pour n'importe quelle ville en France
              </CardTitle>
              <CardDescription className="text-lg">
                Données officielles Météo-France - Précipitations, température, vent et pression
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickStats.map((stat, index) => (
                    <div key={index} className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {stat.icon}
                        <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                      </div>
                      <div className="font-bold text-blue-600">{stat.value}</div>
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation des pages */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">🧭 Navigation - Choisissez votre approche</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {navigationCards.map((card, index) => (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {card.icon}
                          <Badge className={card.badge.color}>{card.badge.text}</Badge>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                      <CardDescription className="text-sm">{card.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          {card.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center gap-1 text-xs text-muted-foreground">
                                {feature.icon}
                                {feature.text}
                              </div>
                          ))}
                        </div>
                        <Link href={card.href} className="block mt-4">
                          <Button
                              variant={card.buttonVariant}
                              className="w-full group-hover:bg-primary/90 transition-colors"
                          >
                            {card.buttonText}
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>
          </div>

          {/* Informations techniques */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Données Techniques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <strong>API:</strong> public-api.meteofrance.fr
                </div>
                <div>
                  <strong>Couverture:</strong> Toute la France
                </div>
                <div>
                  <strong>Villes disponibles:</strong> Toutes les villes françaises
                </div>
                <div>
                  <strong>Données:</strong> Température, précipitations, vent, pression
                </div>
                <div>
                  <strong>Précision:</strong> Données horaires
                </div>
                <div>
                  <strong>Format:</strong> CSV officiel Météo-France
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Garanties de Qualité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Données officielles Météo-France</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Qualité validée (code 1)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Traçabilité cryptographique</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Certificat d'authenticité</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Preuve légalement recevable</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center text-muted-foreground">
            <p className="mb-2">Application développée pour l'analyse des données météorologiques officielles</p>
            <p className="text-sm">Toutes les données proviennent directement de l'API publique de Météo-France</p>
          </div>
        </div>
      </div>
  )
}
