"use client"

import type React from "react"

import { useState, useEffect } from "react"

interface ProtectedContentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedContent({ children, fallback }: ProtectedContentProps) {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false)

  useEffect(() => {
    const detectDevTools = () => {
      const threshold = 160
      const widthThreshold = window.outerWidth - window.innerWidth > threshold
      const heightThreshold = window.outerHeight - window.innerHeight > threshold

      if (widthThreshold || heightThreshold) {
        setIsDevToolsOpen(true)
      } else {
        setIsDevToolsOpen(false)
      }
    }

    // Vérifier toutes les 100ms
    const interval = setInterval(detectDevTools, 100)

    // Vérification initiale
    detectDevTools()

    return () => clearInterval(interval)
  }, [])

  if (isDevToolsOpen) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center z-[9999]">
        {fallback || (
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold mb-2">Accès Restreint</h1>
            <p className="text-lg">Les outils de développement ne sont pas autorisés.</p>
            <p className="text-sm mt-4 opacity-75">Fermez les outils de développement pour continuer.</p>
          </div>
        )}
      </div>
    )
  }

  return <>{children}</>
}
