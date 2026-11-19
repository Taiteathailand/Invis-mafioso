import { useEffect, useRef, useState } from 'react'
import GameFrame from '../components/GameFrame'
import { useHighScore } from '../hooks'

const empty = () => Array.from({ length: 4 }, () => Array(4).fill(0))
const tr = (b) => b[0].map((_, i) => b.map((r) => r[i]))

const addTile = (b) => {
  const free = []
  b.forEach((r, i) => r.forEach((v, j) => !v && free.push([i, j])))
  if (!free.length) return b
  const [i, j] = free[Math.floor(Math.random() * free.length)]
  const n = b.map((r) => [...r])
  n[i][j] = Math.random() < 0.9 ? 2 : 4
  return n
}

const slide = (row) => {
  const a = row.filter(Boolean)
  let gain = 0
  for (let i = 0; i < a.length - 1; i++) {
    if (a[i] === a[i + 1]) {
      a[i] *= 2
      gain += a[i]
      a.splice(i + 1, 1)
    }
  }
  while (a.length < 4) a.push(0)
  return [a, gain]
}

// d: 0 left, 1 up, 2 right, 3 down
const move = (b, d) => {
  let gain = 0
  let x = d === 1 || d === 3 ? tr(b) : b
  const rev = d === 2 || d === 3
  x = x.map((r) => {
    const [s, g] = slide(rev ? [...r].reverse() : r)
    gain += g
    return rev ? s.reverse() : s
  })
  if (d === 1 || d === 3) x = tr(x)
  return { b: x, gain, moved: JSON.stringify(x) !== JSON.stringify(b) }
}

const canMove = (b) => [0, 1, 2, 3].some((d) => move(b, d).moved)
const start = () => ({ b: addTile(addTile(empty())), score: 0, over: false })
const COLORS = { 0: 'rgba(255,255,255,.06)', 2: '#3b3b46', 4: '#4a4a58', 8: '#a9772b', 16: '#c58a2a', 32: '#d4af37', 64: '#e0b93e', 128: '#f3d77a', 256: '#f0c850', 512: '#e8b73a', 1024: '#e67e22', 2048: '#c0392b' }

export default function Game2048() {
  const [s, setS] = useState(start)
  const [best, report] = useHighScore('2048')
  const touch = useRef(null)

  const go = (d) =>
    setS((p) => {
      if (p.over) return p
      const r = move(p.b, d)
      if (!r.moved) return p
      const nb = addTile(r.b)
      return { b: nb, score: p.score + r.gain, over: !canMove(nb) }
    })

  useEffect(() => {
    const keys = { ArrowLeft: 0, a: 0, ArrowUp: 1, w: 1, ArrowRight: 2, d: 2, ArrowDown: 3, s: 3 }
    const onKey = (e) => {
      if (keys[e.key] !== undefined) {
        e.preventDefault()
        go(keys[e.key])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (s.over) report(s.score)
  }, [s.over])

  const onTouchStart = (e) => {
    const t = e.touches[0]
    touch.current = [t.clientX, t.clientY]
  }
  const onTouchEnd = (e) => {
    if (!touch.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touch.current[0]
    const dy = t.clientY - touch.current[1]
    touch.current = null
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return
    if (Math.abs(dx) > Math.abs(dy)) go(dx > 0 ? 2 : 0)
    else go(dy > 0 ? 3 : 1)
  }

  return (
    <GameFrame title="2048" score={s.score} best={best} onRestart={() => setS(start())} hint="Arrow keys / WASD, or swipe on the board.">
      <div
        className="board"
        style={{ gridTemplateColumns: 'repeat(4, 80px)', touchAction: 'none' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {s.b.flat().map((v, i) => (
          <div
            key={i}
            className="cell"
            style={{ width: 80, height: 80, cursor: 'default', background: COLORS[v] || '#8e44ad', fontSize: v > 999 ? '1.2rem' : '1.5rem' }}
          >
            {v || ''}
          </div>
        ))}
      </div>
      {s.over && <div className="overlay">No moves left — hit Restart</div>}
    </GameFrame>
  )
}
