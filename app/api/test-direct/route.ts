import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey, url } = await request.json()

    if (!apiKey || !url) {
      return NextResponse.json({ error: "Clé API et URL requises" }, { status: 400 })
    }

    console.log(`Test direct avec URL: ${url}`)
    console.log(`Clé API (premiers caractères): ${apiKey.substring(0, 8)}...`)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: apiKey,
        Accept: "application/json",
        "User-Agent": "MeteoApp-Test/1.0",
      },
    })

    const responseHeaders = Object.fromEntries(response.headers.entries())

    let responseData
    const contentType = response.headers.get("content-type")

    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json()
    } else {
      responseData = await response.text()
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data: responseData,
      url: url,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erreur test direct:", error)
    return NextResponse.json(
      {
        error: "Erreur lors du test direct",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
