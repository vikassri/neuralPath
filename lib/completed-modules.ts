"use client"

import { useSyncExternalStore } from "react"

const STORAGE_KEY = "completedModules"
const CHANGE_EVENT = "completed-modules-change"
const EMPTY_MODULES: string[] = []

let cachedStorageValue: string | null | undefined
let cachedModules = EMPTY_MODULES

function getSnapshot(): string[] {
  if (typeof window === "undefined") return EMPTY_MODULES

  let storageValue: string | null
  try {
    storageValue = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return cachedModules
  }

  if (storageValue === cachedStorageValue) return cachedModules

  cachedStorageValue = storageValue
  try {
    const parsed: unknown = storageValue ? JSON.parse(storageValue) : []
    cachedModules = Array.isArray(parsed) && parsed.every((value) => typeof value === "string")
      ? parsed
      : EMPTY_MODULES
  } catch {
    cachedModules = EMPTY_MODULES
  }

  return cachedModules
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback)
  window.addEventListener(CHANGE_EVENT, callback)
  return () => {
    window.removeEventListener("storage", callback)
    window.removeEventListener(CHANGE_EVENT, callback)
  }
}

export function useCompletedModules(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_MODULES)
}

export function markModuleCompleted(slug: string): void {
  const completed = getSnapshot()
  if (completed.includes(slug)) return

  const next = [...completed, slug]
  const serialized = JSON.stringify(next)
  window.localStorage.setItem(STORAGE_KEY, serialized)
  cachedStorageValue = serialized
  cachedModules = next
  window.dispatchEvent(new Event(CHANGE_EVENT))
}
