import { type NextRequest, NextResponse } from "next/server"

// Base de données des coordonnées des villes françaises (version simplifiée)
// En production, il faudrait utiliser une base de données complète ou une API externe
const villesCoordonnees: Record<string, { lat: number; lon: number; departement: string }> = {
  // Île-de-France
  Paris: { lat: 48.8566, lon: 2.3522, departement: "75" },

  // Provence-Alpes-Côte d'Azur
  Marseille: { lat: 43.2965, lon: 5.3698, departement: "13" },
  Nice: { lat: 43.7102, lon: 7.262, departement: "06" },
  Toulon: { lat: 43.1242, lon: 5.928, departement: "83" },
  "Aix-en-Provence": { lat: 43.5297, lon: 5.4474, departement: "13" },
  Avignon: { lat: 43.9493, lon: 4.8055, departement: "84" },

  // Auvergne-Rhône-Alpes
  Lyon: { lat: 45.7578, lon: 4.832, departement: "69" },
  Grenoble: { lat: 45.1885, lon: 5.7245, departement: "38" },
  "Saint-Étienne": { lat: 45.4397, lon: 4.3872, departement: "42" },
  Villeurbanne: { lat: 45.7681, lon: 4.8812, departement: "69" },
  "Clermont-Ferrand": { lat: 45.7772, lon: 3.087, departement: "63" },
  Annecy: { lat: 45.8992, lon: 6.1294, departement: "74" },
  Arenthon: { lat: 46.1167, lon: 6.2167, departement: "74" },
  Annemasse: { lat: 46.1931, lon: 6.2336, departement: "74" },
  Bonneville: { lat: 46.0764, lon: 6.4084, departement: "74" },
  Chamonix: { lat: 45.9237, lon: 6.8694, departement: "74" },
  "Thonon-les-Bains": { lat: 46.3705, lon: 6.4784, departement: "74" },
  Chambéry: { lat: 45.5646, lon: 5.9178, departement: "73" },

  // Occitanie
  Toulouse: { lat: 43.6047, lon: 1.4442, departement: "31" },
  Montpellier: { lat: 43.6108, lon: 3.8767, departement: "34" },
  Nîmes: { lat: 43.8367, lon: 4.3601, departement: "30" },
  Perpignan: { lat: 42.6886, lon: 2.8948, departement: "66" },

  // Nouvelle-Aquitaine
  Bordeaux: { lat: 44.8378, lon: -0.5792, departement: "33" },
  Limoges: { lat: 45.8315, lon: 1.2578, departement: "87" },
  "La Rochelle": { lat: 46.1603, lon: -1.1511, departement: "17" },

  // Pays de la Loire
  Nantes: { lat: 47.2184, lon: -1.5536, departement: "44" },
  Angers: { lat: 47.4784, lon: -0.5632, departement: "49" },
  "Le Mans": { lat: 48.0061, lon: 0.1996, departement: "72" },

  // Grand Est
  Strasbourg: { lat: 48.5734, lon: 7.7521, departement: "67" },
  Reims: { lat: 49.2583, lon: 4.0317, departement: "51" },
  Metz: { lat: 49.1193, lon: 6.1757, departement: "57" },
  Mulhouse: { lat: 47.7508, lon: 7.3359, departement: "68" },
  Nancy: { lat: 48.6921, lon: 6.1844, departement: "54" },
  Troyes: { lat: 48.2973, lon: 4.0744, departement: "10" },

  // Hauts-de-France
  Lille: { lat: 50.6292, lon: 3.0573, departement: "59" },
  Amiens: { lat: 49.8942, lon: 2.2957, departement: "80" },

  // Bretagne
  Rennes: { lat: 48.1173, lon: -1.6778, departement: "35" },
  Brest: { lat: 48.3904, lon: -4.4861, departement: "29" },

  // Normandie
  "Le Havre": { lat: 49.4944, lon: 0.1079, departement: "76" },
  Rouen: { lat: 49.4431, lon: 1.0993, departement: "76" },
  Caen: { lat: 49.1829, lon: -0.3707, departement: "14" },

  // Bourgogne-Franche-Comté
  Dijon: { lat: 47.322, lon: 5.0415, departement: "21" },
  Besançon: { lat: 47.2378, lon: 6.0241, departement: "25" },

  // Centre-Val de Loire
  Orléans: { lat: 47.9029, lon: 1.9039, departement: "45" },
  Tours: { lat: 47.3941, lon: 0.6848, departement: "37" },
  Poitiers: { lat: 46.5802, lon: 0.3404, departement: "86" },
}

export async function POST(request: NextRequest) {
  try {
    const { apiKey, ville, departement } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: "Clé API manquante" }, { status: 400 })
    }

    // Récupérer les coordonnées de la ville
    const villeCoords = villesCoordonnees[ville]
    if (!villeCoords) {
      return NextResponse.json({ error: "Ville non trouvée dans la base de données" }, { status: 404 })
    }

    const baseUrl = "https://public-api.meteofrance.fr/public/DPClim/v1"

    // Utiliser le département fourni pour une recherche ciblée
    const targetDepartement = departement || villeCoords.departement

    if (!targetDepartement) {
      return NextResponse.json({ error: "Département non spécifié pour cette ville" }, { status: 400 })
    }

    console.log(`Recherche de stations dans le département ${targetDepartement} pour ${ville}`)

    // Recherche ciblée dans le département spécifique
    const apiUrl = `${baseUrl}/liste-stations/horaire?id-departement=${targetDepartement}`

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
          error: `Erreur API Météo-France pour le département ${targetDepartement}: ${response.status}`,
          details: errorText,
          url: apiUrl,
        },
        { status: response.status },
      )
    }

    const data = await response.json()

    let validStations: any[] = []
    if (Array.isArray(data)) {
      // Filtrer les stations ouvertes et publiques
      validStations = data.filter((station: any) => {
        return station.posteOuvert && station.postePublic && station.lat && station.lon
      })
    }

    // Calculer la distance pour chaque station et trier
    const stationsWithDistance = validStations
      .map((station: any) => {
        // Calculer la distance approximative (formule de Haversine simplifiée)
        const distance = Math.sqrt(
          Math.pow((station.lat - villeCoords.lat) * 111, 2) +
            Math.pow((station.lon - villeCoords.lon) * 111 * Math.cos((villeCoords.lat * Math.PI) / 180), 2),
        )

        return {
          ...station,
          distance: distance,
          distanceKm: Math.round(distance),
          departement: targetDepartement,
        }
      })
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, 10) // Limiter aux 10 stations les plus proches

    return NextResponse.json({
      success: true,
      ville: ville,
      departement: targetDepartement,
      coordonnees: villeCoords,
      stations: stationsWithDistance,
      totalStations: stationsWithDistance.length,
      apiRequestsUsed: 1, // Une seule requête utilisée grâce au département ciblé
    })
  } catch (error) {
    console.error("Erreur lors de la recherche des stations:", error)
    return NextResponse.json(
      {
        error: "Erreur serveur lors de la recherche des stations",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
