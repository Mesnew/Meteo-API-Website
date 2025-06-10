"use client"

import type React from "react"

import { DevToolsBlocker } from "./DevToolsBlocker"
import { AntiDebugger } from "./AntiDebugger"

interface SecurityWrapperProps {
  children: React.ReactNode
}

export function SecurityWrapper({ children }: SecurityWrapperProps) {
  return (
    <>
      <DevToolsBlocker />
      <AntiDebugger />
      <div className="select-none">{children}</div>
    </>
  )
}
