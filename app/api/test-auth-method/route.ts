import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url, headers, methodName } = await request.json()

    console.log(`Test de ${methodName} avec URL: ${url}`)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...headers,
        "User-Agent": "MeteoApp-AuthTest/1.0",
      },
    })

    const responseHeaders = Object.fromEntries(response.headers.entries())
    let responseData

    try {
      const contentType = response.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }
    } catch (parseError) {
      responseData = "Impossible de parser la réponse"
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      response: responseData,
      method: methodName,
    })
  } catch (error) {
    console.error(`Erreur test auth:`, error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
      status: "Network Error",
    })
  }
}
