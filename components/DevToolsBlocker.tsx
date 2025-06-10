"use client"

import { useEffect } from "react"

export function DevToolsBlocker() {
  useEffect(() => {
    // Désactiver le clic droit
    const disableRightClick = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // Désactiver les raccourcis clavier
    const disableKeyboardShortcuts = (e: KeyboardEvent) => {
      // F12
      if (e.keyCode === 123) {
        e.preventDefault()
        return false
      }

      // Ctrl+Shift+I (Outils de développement)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault()
        return false
      }

      // Ctrl+Shift+C (Sélecteur d'élément)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
        e.preventDefault()
        return false
      }

      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault()
        return false
      }

      // Ctrl+U (Afficher le code source)
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault()
        return false
      }

      // Ctrl+S (Sauvegarder)
      if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault()
        return false
      }

      // Ctrl+A (Sélectionner tout)
      if (e.ctrlKey && e.keyCode === 65) {
        e.preventDefault()
        return false
      }

      // Ctrl+P (Imprimer)
      if (e.ctrlKey && e.keyCode === 80) {
        e.preventDefault()
        return false
      }
    }

    // Détection des outils de développement
    const detectDevTools = () => {
      const threshold = 160

      setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold || window.outerWidth - window.innerWidth > threshold) {
          // Rediriger ou afficher un message d'avertissement
          document.body.innerHTML = `
            <div style="
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: #000;
              color: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: Arial, sans-serif;
              font-size: 24px;
              z-index: 999999;
            ">
              🚫 Accès non autorisé détecté
            </div>
          `
        }
      }, 500)
    }

    // Désactiver la sélection de texte
    const disableTextSelection = () => {
      document.body.style.userSelect = "none"
      document.body.style.webkitUserSelect = "none"
      document.body.style.mozUserSelect = "none"
      document.body.style.msUserSelect = "none"
    }

    // Désactiver le glisser-déposer
    const disableDragDrop = (e: DragEvent) => {
      e.preventDefault()
      return false
    }

    // Obscurcir la console
    const obfuscateConsole = () => {
      // Redéfinir console.log pour masquer les informations
      const originalLog = console.log
      console.log = () => {}
      console.warn = () => {}
      console.error = () => {}
      console.info = () => {}
      console.debug = () => {}

      // Ajouter des messages trompeurs
      setTimeout(() => {
        originalLog("%c🔒 Application sécurisée", "color: red; font-size: 20px; font-weight: bold;")
        originalLog("%cToute tentative d'inspection est surveillée et enregistrée.", "color: orange; font-size: 14px;")
      }, 1000)
    }

    // Appliquer toutes les protections
    document.addEventListener("contextmenu", disableRightClick)
    document.addEventListener("keydown", disableKeyboardShortcuts)
    document.addEventListener("dragstart", disableDragDrop)
    document.addEventListener("selectstart", disableRightClick)

    disableTextSelection()
    detectDevTools()
    obfuscateConsole()

    // Nettoyage
    return () => {
      document.removeEventListener("contextmenu", disableRightClick)
      document.removeEventListener("keydown", disableKeyboardShortcuts)
      document.removeEventListener("dragstart", disableDragDrop)
      document.removeEventListener("selectstart", disableRightClick)
    }
  }, [])

  return null
}
