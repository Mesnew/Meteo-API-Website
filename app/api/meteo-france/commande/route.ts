import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey, stationId, dateDebut, dateFin } = await request.json()

    if (!apiKey || !stationId || !dateDebut || !dateFin) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })
    }

    const baseUrl = "https://public-api.meteofrance.fr/public/DPClim/v1"

    // Commander les données horaires
    const apiUrl = `${baseUrl}/commande-station/horaire?id-station=${stationId}&date-deb-periode=${dateDebut}&date-fin-periode=${dateFin}`

    console.log(`Commande vers: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        apikey: apiKey, // Utiliser "apikey" au lieu de "Authorization: Bearer"
        Accept: "application/json",
        "User-Agent": "MeteoApp/1.0",
      },
    })

    console.log(`Statut commande: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        {
          error: `Erreur lors de la commande: ${response.status}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`Commande créée: ${JSON.stringify(data)}`)

    return NextResponse.json({
      success: true,
      commandeId: data.elaboreProduitAvecDemandeResponse?.return || data.id || data,
      originalResponse: data,
    })
  } catch (error) {
    console.error("Erreur lors de la commande:", error)
    return NextResponse.json(
      {
        error: "Erreur serveur lors de la commande",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
