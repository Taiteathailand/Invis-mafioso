import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage(key, initial) {
  const [v, setV] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? initial : JSON.parse(raw)
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v))
    } catch {}
  }, [key, v])
  return [v, setV]
}

// Returns [best, report]. report(score) saves it if it beats the old best.
// Pass lower=true for games where a smaller number is better (time, moves).
export function useHighScore(id, lower = false) {
  const key = 'hs:' + id
  const [best, setBest] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? null : Number(raw)
    } catch {
      return null
    }
  })
  const report = useCallback(
    (s) => {
      setBest((b) => {
        const better = b === null || (lower ? s < b : s > b)
        if (better) {
          try {
            localStorage.setItem(key, String(s))
          } catch {}
          return s
        }
        return b
      })
    },
    [key, lower]
  )
  return [best, report]
}
