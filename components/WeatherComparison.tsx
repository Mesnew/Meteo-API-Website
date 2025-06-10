"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Droplets, Thermometer, Wind, Gauge, ArrowUp, ArrowDown, Minus } from "lucide-react"

interface WeatherData {
  ville: string
  date: string
  time: string
  temperature?: number
  precipitation?: number
  humidity?: number
  windSpeed?: number
  pressure?: number
  pleuvait: boolean
}

interface WeatherComparisonProps {
  data1: WeatherData
  data2: WeatherData
}

export function WeatherComparison({ data1, data2 }: WeatherComparisonProps) {
  const metrics = [
    {
      key: "precipitation",
      label: "Précipitations",
      unit: "mm",
      icon: <Droplets className="h-4 w-4 text-blue-500" />,
      getValue: (data: WeatherData) => data.precipitation || 0,
    },
    {
      key: "temperature",
      label: "Température",
      unit: "°C",
      icon: <Thermometer className="h-4 w-4 text-orange-500" />,
      getValue: (data: WeatherData) => data.temperature,
    },
    {
      key: "humidity",
      label: "Humidité",
      unit: "%",
      icon: <Droplets className="h-4 w-4 text-cyan-500" />,
      getValue: (data: WeatherData) => data.humidity,
    },
    {
      key: "windSpeed",
      label: "Vent",
      unit: "km/h",
      icon: <Wind className="h-4 w-4 text-green-500" />,
      getValue: (data: WeatherData) => data.windSpeed,
    },
    {
      key: "pressure",
      label: "Pression",
      unit: "hPa",
      icon: <Gauge className="h-4 w-4 text-purple-500" />,
      getValue: (data: WeatherData) => data.pressure,
    },
  ]

  const getComparison = (value1?: number, value2?: number) => {
    if (value1 === undefined || value2 === undefined)
      return { icon: <Minus className="h-4 w-4 text-gray-400" />, text: "N/A", color: "text-gray-400" }

    const diff = value1 - value2
    if (Math.abs(diff) < 0.1)
      return { icon: <Minus className="h-4 w-4 text-gray-500" />, text: "Identique", color: "text-gray-500" }
    if (diff > 0)
      return { icon: <ArrowUp className="h-4 w-4 text-red-500" />, text: `+${diff.toFixed(1)}`, color: "text-red-500" }
    return { icon: <ArrowDown className="h-4 w-4 text-blue-500" />, text: diff.toFixed(1), color: "text-blue-500" }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <ArrowUp className="h-5 w-5 text-purple-600" />
          Comparaison météorologique
        </CardTitle>
        <CardDescription>
          Comparaison entre {data1.ville} et {data2.ville}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {/* En-têtes de comparaison */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <div className="font-semibold text-blue-800">{data1.ville}</div>
            <div className="text-sm text-blue-600">
              {formatDate(data1.date)} à {data1.time}
            </div>
            <Badge className={data1.pleuvait ? "bg-blue-100 text-blue-800 mt-2" : "bg-green-100 text-green-800 mt-2"}>
              {data1.pleuvait ? "🌧️ Pluie" : "☀️ Sec"}
            </Badge>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-2xl font-bold text-purple-600">VS</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <div className="font-semibold text-green-800">{data2.ville}</div>
            <div className="text-sm text-green-600">
              {formatDate(data2.date)} à {data2.time}
            </div>
            <Badge className={data2.pleuvait ? "bg-blue-100 text-blue-800 mt-2" : "bg-green-100 text-green-800 mt-2"}>
              {data2.pleuvait ? "🌧️ Pluie" : "☀️ Sec"}
            </Badge>
          </div>
        </div>

        {/* Comparaison des métriques */}
        <div className="space-y-4">
          {metrics.map((metric) => {
            const value1 = metric.getValue(data1)
            const value2 = metric.getValue(data2)
            const comparison = getComparison(value1, value2)

            return (
              <div key={metric.key} className="grid grid-cols-3 gap-4 items-center p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {metric.icon}
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <div className="text-lg font-bold">
                    {value1 !== undefined ? `${value1.toFixed(1)} ${metric.unit}` : "N/A"}
                  </div>
                </div>

                <div className="text-center">
                  <div className={`flex items-center justify-center gap-1 ${comparison.color}`}>
                    {comparison.icon}
                    <span className="text-sm font-medium">{comparison.text}</span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-bold">
                    {value2 !== undefined ? `${value2.toFixed(1)} ${metric.unit}` : "N/A"}
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
