import { useState } from 'react'
import GameFrame from '../components/GameFrame'
import { useHighScore } from '../hooks'

const R = 6
const C = 7
const empty = () => Array.from({ length: R }, () => Array(C).fill(null))

const dropRow = (b, c) => {
  for (let r = R - 1; r >= 0; r--) if (!b[r][c]) return r
  return -1
}

const hasWin = (b, p) => {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]]
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      for (const [dr, dc] of dirs) {
        let ok = true
        for (let k = 0; k < 4; k++) {
          const nr = r + dr * k
          const nc = c + dc * k
          if (nr < 0 || nc < 0 || nr >= R || nc >= C || b[nr][nc] !== p) {
            ok = false
            break
          }
        }
        if (ok) return true
      }
  return false
}

const place = (b, c, p) => {
  const r = dropRow(b, c)
  if (r < 0) return null
  const nb = b.map((row) => [...row])
  nb[r][c] = p
  return nb
}

const aiPick = (b) => {
  const cols = [0, 1, 2, 3, 4, 5, 6].filter((c) => dropRow(b, c) >= 0)
  for (const c of cols) if (hasWin(place(b, c, 'y'), 'y')) return c
  for (const c of cols) if (hasWin(place(b, c, 'r'), 'r')) return c
  const pref = [3, 2, 4, 1, 5, 0, 6].filter((c) => cols.includes(c))
  // avoid handing the human an immediate win
  const safe = pref.filter((c) => {
    const nb = place(b, c, 'y')
    return !([0, 1, 2, 3, 4, 5, 6].some((c2) => dropRow(nb, c2) >= 0 && hasWin(place(nb, c2, 'r'), 'r')))
  })
  const pool = safe.length ? safe : pref
  return Math.random() < 0.7 ? pool[0] : pool[Math.floor(Math.random() * pool.length)]
}

export default function Connect4() {
  const [b, setB] = useState(empty)
  const [state, setState] = useState('play')
  const [wins, setWins] = useState(0)
  const [best, report] = useHighScore('connect4')

  const play = (c) => {
    if (state !== 'play') return
    let nb = place(b, c, 'r')
    if (!nb) return
    if (hasWin(nb, 'r')) {
      setB(nb)
      setState('won')
      const n = wins + 1
      setWins(n)
      report(n)
      return
    }
    if (nb.every((row) => row.every(Boolean))) {
      setB(nb)
      setState('draw')
      return
    }
    nb = place(nb, aiPick(nb), 'y')
    setB(nb)
    if (hasWin(nb, 'y')) setState('lost')
    else if (nb.every((row) => row.every(Boolean))) setState('draw')
  }

  const again = () => {
    setB(empty())
    setState('play')
  }

  return (
    <GameFrame title="Connect 4" score={wins} best={best} scoreLabel="Wins" bestLabel="Best wins" onRestart={() => { again(); setWins(0) }} hint="You are red. Click a column to drop a disc.">
      <div className="c4">
        {Array.from({ length: R * C }, (_, i) => {
          const r = Math.floor(i / C)
          const c = i % C
          const v = b[r][c]
          return <button key={i} className={v === 'r' ? 'r' : v === 'y' ? 'y' : ''} onClick={() => play(c)} aria-label={`Column ${c + 1}`} />
        })}
      </div>
      {state === 'won' && <div className="overlay">You win! 🎉</div>}
      {state === 'lost' && <div className="overlay">Computer wins</div>}
      {state === 'draw' && <div className="overlay">Draw</div>}
      {state !== 'play' && (
        <button className="btn gold" onClick={again}>
          Next round
        </button>
      )}
    </GameFrame>
  )
}
