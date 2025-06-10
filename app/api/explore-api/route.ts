import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey, baseUrl } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: "Clé API manquante" }, { status: 400 })
    }

    // URLs possibles basées sur la documentation Météo-France
    const possibleEndpoints = [
      // Nouvelles URLs basées sur la structure standard des APIs REST
      `${baseUrl}/stations`,
      `${baseUrl}/stations/liste`,
      `${baseUrl}/referentiel/stations`,
      `${baseUrl}/climatologie/stations`,
      `${baseUrl}/observations/stations`,

      // URLs avec versions
      `${baseUrl}/v1/stations`,
      `${baseUrl}/v2/stations`,
      `${baseUrl}/v1/referentiel/stations`,
      `${baseUrl}/v1/climatologie/stations`,

      // URLs spécifiques DPClim
      `${baseUrl}/DPClim/v1/stations`,
      `${baseUrl}/DPClim/v1/liste-stations`,
      `${baseUrl}/DPClim/v1/referentiel/stations`,
    ]

    const results = []

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Test de l'endpoint: ${endpoint}`)

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            apikey: apiKey,
            Accept: "application/json",
            "User-Agent": "MeteoApp-Explorer/1.0",
          },
        })

        const contentType = response.headers.get("content-type") || ""
        const isJson = contentType.includes("application/json")

        let responseData
        let isHtml = false

        if (isJson) {
          responseData = await response.json()
        } else {
          const textData = await response.text()
          isHtml = textData.includes("<!DOCTYPE") || textData.includes("<html")
          responseData = isHtml ? "Page HTML retournée" : textData
        }

        results.push({
          endpoint,
          status: response.status,
          statusText: response.statusText,
          contentType,
          isJson,
          isHtml,
          success: response.ok && isJson,
          dataPreview: isJson
            ? JSON.stringify(responseData).substring(0, 200) + "..."
            : responseData.toString().substring(0, 200) + "...",
          headers: Object.fromEntries(response.headers.entries()),
        })

        // Si on trouve un endpoint qui fonctionne, on peut s'arrêter
        if (response.ok && isJson) {
          console.log(`Endpoint fonctionnel trouvé: ${endpoint}`)
          break
        }
      } catch (error) {
        results.push({
          endpoint,
          error: error instanceof Error ? error.message : "Erreur inconnue",
          success: false,
        })
      }
    }

    return NextResponse.json({
      results,
      summary: {
        total: results.length,
        successful: results.filter((r) => r.success).length,
        htmlResponses: results.filter((r) => r.isHtml).length,
        errors: results.filter((r) => r.error).length,
      },
    })
  } catch (error) {
    console.error("Erreur exploration API:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de l'exploration de l'API",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
