import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey, commandeId } = await request.json()

    if (!apiKey || !commandeId) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })
    }

    const baseUrl = "https://public-api.meteofrance.fr/public/DPClim/v1"

    // Télécharger le fichier de données
    const apiUrl = `${baseUrl}/commande/fichier?id-cmde=${commandeId}`

    console.log(`Téléchargement depuis: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        apikey: apiKey, // Utiliser "apikey" au lieu de "Authorization: Bearer"
        Accept: "text/csv,application/json",
        "User-Agent": "MeteoApp/1.0",
      },
    })

    console.log(`Statut téléchargement: ${response.status}`)

    if (response.status === 204) {
      return NextResponse.json({
        success: false,
        status: "pending",
        message: "Production encore en attente ou en cours",
      })
    }

    if (response.status === 410) {
      return NextResponse.json({
        success: false,
        status: "already_delivered",
        message: "Production déjà livrée",
      })
    }

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        {
          error: `Erreur lors du téléchargement: ${response.status}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const contentType = response.headers.get("content-type") || ""

    if (contentType.includes("text/csv") || contentType.includes("text/plain")) {
      const csvData = await response.text()
      return NextResponse.json({
        success: true,
        status: "ready",
        data: csvData,
        contentType: contentType,
      })
    } else {
      const jsonData = await response.json()
      return NextResponse.json({
        success: true,
        status: "ready",
        data: jsonData,
        contentType: contentType,
      })
    }
  } catch (error) {
    console.error("Erreur lors du téléchargement:", error)
    return NextResponse.json(
      {
        error: "Erreur serveur lors du téléchargement",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
