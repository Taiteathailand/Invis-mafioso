import { useEffect, useState } from 'react'
import GameFrame from '../components/GameFrame'
import { useHighScore } from '../hooks'

const R = 9
const C = 9
const M = 10
const NUM_COLORS = ['', '#64b5f6', '#81c784', '#e57373', '#ba68c8', '#ffb74d', '#4dd0e1', '#fff', '#999']

const blank = () => Array.from({ length: R }, () => Array.from({ length: C }, () => ({ m: false, o: false, f: false, n: 0 })))
const clone = (b) => b.map((r) => r.map((c) => ({ ...c })))
const around = (r, c, fn) => {
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue
      const nr = r + dr
      const nc = c + dc
      if (nr >= 0 && nc >= 0 && nr < R && nc < C) fn(nr, nc)
    }
}

const seedMines = (b, sr, sc) => {
  let placed = 0
  while (placed < M) {
    const r = Math.floor(Math.random() * R)
    const c = Math.floor(Math.random() * C)
    if (b[r][c].m || (Math.abs(r - sr) <= 1 && Math.abs(c - sc) <= 1)) continue
    b[r][c].m = true
    placed++
  }
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) {
      let n = 0
      around(r, c, (nr, nc) => b[nr][nc].m && n++)
      b[r][c].n = n
    }
}

const reveal = (b, r, c) => {
  const stack = [[r, c]]
  while (stack.length) {
    const [cr, cc] = stack.pop()
    const cell = b[cr][cc]
    if (cell.o || cell.f) continue
    cell.o = true
    if (cell.n === 0 && !cell.m) around(cr, cc, (nr, nc) => stack.push([nr, nc]))
  }
}

export default function Minesweeper() {
  const [b, setB] = useState(blank)
  const [started, setStarted] = useState(false)
  const [state, setState] = useState('play') // play | won | lost
  const [flagMode, setFlagMode] = useState(false)
  const [time, setTime] = useState(0)
  const [best, report] = useHighScore('minesweeper', true)

  useEffect(() => {
    if (!started || state !== 'play') return
    const id = setInterval(() => setTime((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [started, state])

  const click = (r, c, flag) => {
    if (state !== 'play') return
    const nb = clone(b)
    const cell = nb[r][c]
    if (flag || flagMode) {
      if (!cell.o) cell.f = !cell.f
      setB(nb)
      return
    }
    if (cell.f || cell.o) return
    if (!started) {
      seedMines(nb, r, c)
      setStarted(true)
    }
    if (cell.m) {
      nb.forEach((row) => row.forEach((x) => x.m && (x.o = true)))
      setB(nb)
      setState('lost')
      return
    }
    reveal(nb, r, c)
    setB(nb)
    if (nb.every((row) => row.every((x) => x.m || x.o))) {
      setState('won')
      report(time)
    }
  }

  const restart = () => {
    setB(blank())
    setStarted(false)
    setState('play')
    setTime(0)
  }

  const flags = b.flat().filter((x) => x.f).length

  return (
    <GameFrame title="Minesweeper" score={`${time}s`} best={best === null ? null : `${best}s`} scoreLabel="Time" bestLabel="Best time" onRestart={restart} hint="Click to reveal. Right-click (or the Flag mode button on touch) to flag mines.">
      <div className="row">
        <span>💣 {M - flags}</span>
        <button className={'btn sm' + (flagMode ? ' gold' : '')} onClick={() => setFlagMode((f) => !f)}>
          🚩 Flag mode {flagMode ? 'ON' : 'OFF'}
        </button>
      </div>
      <div className="board" style={{ gridTemplateColumns: `repeat(${C}, 34px)`, gap: 3 }}>
        {b.map((row, r) =>
          row.map((x, c) => (
            <button
              key={r + '-' + c}
              className="cell"
              style={{ width: 34, height: 34, fontSize: '1rem', background: x.o ? 'rgba(0,0,0,.45)' : undefined, color: NUM_COLORS[x.n] }}
              onClick={() => click(r, c, false)}
              onContextMenu={(e) => {
                e.preventDefault()
                click(r, c, true)
              }}
            >
              {x.o ? (x.m ? '💥' : x.n || '') : x.f ? '🚩' : ''}
            </button>
          ))
        )}
      </div>
      {state === 'won' && <div className="overlay">You cleared it in {time}s! 🎉</div>}
      {state === 'lost' && <div className="overlay">Boom. Hit Restart.</div>}
    </GameFrame>
  )
}
