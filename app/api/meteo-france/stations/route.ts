import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: "Clé API manquante" }, { status: 400 })
    }

    const baseUrl = "https://public-api.meteofrance.fr/public/DPClim/v1"
    const departement = 74
    const apiUrl = `${baseUrl}/liste-stations/horaire?id-departement=${departement}`

    console.log(`Requête vers: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        apikey: apiKey,
        Accept: "application/json",
        "User-Agent": "MeteoApp/1.0",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        {
          error: `Erreur API Météo-France: ${response.status}`,
          details: errorText,
          url: apiUrl,
        },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Coordonnées d'Arenthon (autoroute A40)
    const arenthonLat = 46.1167
    const arenthonLon = 6.2167

    let nearbyStations = []
    if (Array.isArray(data)) {
      nearbyStations = data
        .filter((station: any) => {
          // Vérifier que la station est ouverte et publique
          if (!station.posteOuvert || !station.postePublic) return false
          if (!station.lat || !station.lon) return false

          // Calculer la distance approximative
          const distance = Math.sqrt(Math.pow(station.lat - arenthonLat, 2) + Math.pow(station.lon - arenthonLon, 2))

          return distance < 0.3 // Environ 30km pour avoir plus de choix
        })
        .map((station: any) => {
          // Calculer la distance exacte pour le tri
          const distance = Math.sqrt(Math.pow(station.lat - arenthonLat, 2) + Math.pow(station.lon - arenthonLon, 2))
          return {
            ...station,
            distanceFromArenthon: distance,
            distanceKm: Math.round(distance * 111), // Conversion approximative en km
          }
        })
        .sort((a: any, b: any) => a.distanceFromArenthon - b.distanceFromArenthon)
        .slice(0, 10) // Limiter à 10 stations les plus proches
    }

    return NextResponse.json({
      success: true,
      stations: nearbyStations,
      totalStations: Array.isArray(data) ? data.length : 0,
      departement: departement,
      arenthonCoords: { lat: arenthonLat, lon: arenthonLon },
      originalResponse: data,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des stations:", error)
    return NextResponse.json(
      {
        error: "Erreur serveur lors de la récupération des stations",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
