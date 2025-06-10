"use client"

import { useEffect } from "react"

export function AntiDebugger() {
  useEffect(() => {
    // Protection anti-debugger
    const antiDebug = () => {
      setInterval(() => {
        // Technique de détection de debugger
        const start = performance.now()
        debugger
        const end = performance.now()

        // Si le debugger est ouvert, il y aura un délai
        if (end - start > 100) {
          // Rediriger ou fermer la page
          window.location.href = "about:blank"
        }
      }, 1000)
    }

    // Protection contre l'ouverture de nouvelles fenêtres de debug
    const originalOpen = window.open
    window.open = (...args) => null

    // Masquer les erreurs JavaScript
    window.onerror = () => true
    window.addEventListener("error", (e) => {
      e.preventDefault()
      return true
    })

    // Protection contre l'inspection des éléments
    const protectElements = () => {
      document.querySelectorAll("*").forEach((element) => {
        element.addEventListener("contextmenu", (e) => {
          e.preventDefault()
          e.stopPropagation()
          return false
        })
      })
    }

    // Démarrer les protections
    antiDebug()
    protectElements()

    // Observer les nouveaux éléments ajoutés au DOM
    const observer = new MutationObserver(() => {
      protectElements()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
      window.open = originalOpen
    }
  }, [])

  return null
}
