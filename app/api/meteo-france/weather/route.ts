import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey, stationId, date } = await request.json()

    if (!apiKey || !stationId) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })
    }

    // Convertir la date au format requis par l'API
    const targetDate = new Date(date)
    const dateStr = targetDate.toISOString().split("T")[0] // Format YYYY-MM-DD

    // URL de l'API Météo-France pour les données horaires
    // Note: L'URL exacte peut varier selon la documentation officielle
    const apiUrl = `https://portail-api.meteofrance.fr/public/DPClim/v1/commande-station/horaire`

    const requestBody = {
      "liste-stations": [stationId],
      "date-debut-periode": dateStr,
      "date-fin-periode": dateStr,
      "grandeurs-meteorologiques": [
        "TEMP", // Température
        "HREL", // Humidité relative
        "PMER", // Pression au niveau mer
        "WDIR", // Direction du vent
        "WSPD", // Vitesse du vent
        "PRCP", // Précipitations
      ],
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        apikey: apiKey,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        {
          error: `Erreur API Météo-France: ${response.status}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Traiter les données pour extraire les valeurs vers 9h05
    let weatherData = {}

    if (data && data.donnees) {
      // Chercher les données les plus proches de 9h05
      const targetHour = 9
      const hourlyData = data.donnees.find((d: any) => {
        const hour = new Date(d.date).getHours()
        return hour === targetHour || hour === targetHour + 1
      })

      if (hourlyData) {
        weatherData = {
          temperature: hourlyData.TEMP,
          humidity: hourlyData.HREL,
          pressure: hourlyData.PMER,
          windSpeed: hourlyData.WSPD,
          windDirection: hourlyData.WDIR,
          precipitation: hourlyData.PRCP,
          timestamp: hourlyData.date,
        }
      }
    }

    return NextResponse.json({
      weather: weatherData,
      originalResponse: data,
      requestedDate: date,
      stationId: stationId,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des données météo:", error)
    return NextResponse.json(
      {
        error: "Erreur serveur lors de la récupération des données météo",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
