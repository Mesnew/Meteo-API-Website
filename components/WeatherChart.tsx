"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Droplets, Thermometer, Wind, Gauge, TrendingUp, TrendingDown, BarChart3 } from "lucide-react"

interface WeatherData {
  temperature?: number
  precipitation?: number
  humidity?: number
  windSpeed?: number
  pressure?: number
}

interface WeatherChartProps {
  data: WeatherData
  title: string
}

export function WeatherChart({ data, title }: WeatherChartProps) {
  const metrics = [
    {
      label: "Précipitations",
      value: data.precipitation || 0,
      max: 10,
      unit: "mm",
      icon: <Droplets className="h-5 w-5 text-blue-500" />,
      color: "bg-blue-500",
      description: "Quantité de pluie mesurée",
    },
    {
      label: "Température",
      value: data.temperature || 0,
      max: 40,
      min: -10,
      unit: "°C",
      icon: <Thermometer className="h-5 w-5 text-orange-500" />,
      color: "bg-orange-500",
      description: "Température de l'air",
    },
  ]

  // Ajouter les autres métriques seulement si elles sont disponibles
  if (data.humidity !== undefined) {
    metrics.push({
      label: "Humidité",
      value: data.humidity,
      max: 100,
      unit: "%",
      icon: <Droplets className="h-5 w-5 text-cyan-500" />,
      color: "bg-cyan-500",
      description: "Humidité relative de l'air",
    })
  }

  if (data.windSpeed !== undefined) {
    metrics.push({
      label: "Vent",
      value: data.windSpeed,
      max: 100,
      unit: "km/h",
      icon: <Wind className="h-5 w-5 text-green-500" />,
      color: "bg-green-500",
      description: "Vitesse du vent",
    })
  }

  if (data.pressure !== undefined) {
    metrics.push({
      label: "Pression",
      value: data.pressure,
      max: 1050,
      min: 950,
      unit: "hPa",
      icon: <Gauge className="h-5 w-5 text-purple-500" />,
      color: "bg-purple-500",
      description: "Pression atmosphérique",
    })
  }

  const getProgressValue = (value: number, max: number, min = 0) => {
    return ((value - min) / (max - min)) * 100
  }

  const getTrend = (value: number, normalValue: number) => {
    if (value > normalValue * 1.1) return { icon: <TrendingUp className="h-4 w-4 text-red-500" />, label: "Élevé" }
    if (value < normalValue * 0.9) return { icon: <TrendingDown className="h-4 w-4 text-blue-500" />, label: "Faible" }
    return { icon: null, label: "Normal" }
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          {title}
        </CardTitle>
        <CardDescription>Visualisation détaillée des paramètres météorologiques</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {metrics.map((metric, index) => {
            const progressValue = getProgressValue(metric.value, metric.max, metric.min)
            const normalValues = { temperature: 15, humidity: 60, pressure: 1013, windSpeed: 10, precipitation: 0 }
            const trend = getTrend(
              metric.value,
              normalValues[metric.label.toLowerCase() as keyof typeof normalValues] || metric.value,
            )

            return (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {metric.icon}
                    <span className="font-medium">{metric.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">
                      {metric.value.toFixed(1)} {metric.unit}
                    </span>
                    {trend.icon && (
                      <Badge variant="outline" className="text-xs">
                        {trend.icon}
                        {trend.label}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress value={Math.max(0, Math.min(100, progressValue))} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {metric.min || 0} {metric.unit}
                    </span>
                    <span className="text-center">{metric.description}</span>
                    <span>
                      {metric.max} {metric.unit}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
