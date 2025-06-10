import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SecurityWrapper } from "@/components/SecurityWrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Météo-France API - Analyse Arenthon",
  description: "Application d'analyse des données météorologiques pour Arenthon",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            /* Désactiver la sélection de texte */
            * {
              -webkit-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
              -webkit-touch-callout: none;
              -webkit-tap-highlight-color: transparent;
            }
            
            /* Masquer le curseur sur les éléments interactifs */
            button, a, input, textarea {
              -webkit-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }
            
            /* Permettre la sélection uniquement pour les champs de saisie */
            input[type="text"], input[type="password"], input[type="email"], 
            input[type="date"], input[type="time"], textarea {
              -webkit-user-select: text;
              -moz-user-select: text;
              -ms-user-select: text;
              user-select: text;
            }
            
            /* Protection contre l'impression */
            @media print {
              * { display: none !important; }
              body::after {
                content: "🚫 Impression non autorisée";
                display: block !important;
                font-size: 24px;
                text-align: center;
                margin-top: 50px;
              }
            }
          `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <SecurityWrapper>{children}</SecurityWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
