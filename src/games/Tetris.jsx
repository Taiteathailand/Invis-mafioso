import { useEffect, useRef, useState } from 'react'
import GameFrame from '../components/GameFrame'
import Pad from '../components/Pad'
import { useHighScore } from '../hooks'

const W = 10
const H = 20
const B = 24
const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
}
const COLORS = { I: '#4dd0e1', O: '#f3d77a', T: '#ba68c8', S: '#81c784', Z: '#e57373', J: '#64b5f6', L: '#ffb74d' }
const KEYS = Object.keys(SHAPES)
const rot = (m) => m[0].map((_, i) => m.map((r) => r[i]).reverse())

const spawn = () => {
  const k = KEYS[Math.floor(Math.random() * KEYS.length)]
  const m = SHAPES[k]
  return { m, color: COLORS[k], x: Math.floor((W - m[0].length) / 2), y: 0 }
}
const fresh = () => ({
  board: Array.from({ length: H }, () => Array(W).fill(null)),
  piece: spawn(),
  score: 0,
  lines: 0,
  over: false,
})

export default function Tetris() {
  const cv = useRef(null)
  const st = useRef(fresh())
  const timer = useRef(null)
  const [score, setScore] = useState(0)
  const [over, setOver] = useState(false)
  const [best, report] = useHighScore('tetris')

  const collide = (m, x, y) => {
    const s = st.current
    for (let r = 0; r < m.length; r++)
      for (let c = 0; c < m[r].length; c++) {
        if (!m[r][c]) continue
        const nx = x + c
        const ny = y + r
        if (nx < 0 || nx >= W || ny >= H) return true
        if (ny >= 0 && s.board[ny][nx]) return true
      }
    return false
  }

  const draw = () => {
    const ctx = cv.current.getContext('2d')
    const s = st.current
    ctx.fillStyle = '#0d0d12'
    ctx.fillRect(0, 0, W * B, H * B)
    for (let r = 0; r < H; r++)
      for (let c = 0; c < W; c++) {
        if (s.board[r][c]) {
          ctx.fillStyle = s.board[r][c]
          ctx.fillRect(c * B + 1, r * B + 1, B - 2, B - 2)
        }
      }
    const p = s.piece
    ctx.fillStyle = p.color
    p.m.forEach((row, r) =>
      row.forEach((v, c) => {
        if (v) ctx.fillRect((p.x + c) * B + 1, (p.y + r) * B + 1, B - 2, B - 2)
      })
    )
  }

  const lock = () => {
    const s = st.current
    const p = s.piece
    p.m.forEach((row, r) =>
      row.forEach((v, c) => {
        if (v && p.y + r >= 0) s.board[p.y + r][p.x + c] = p.color
      })
    )
    let cleared = 0
    s.board = s.board.filter((row) => {
      if (row.every(Boolean)) {
        cleared += 1
        return false
      }
      return true
    })
    while (s.board.length < H) s.board.unshift(Array(W).fill(null))
    if (cleared) {
      s.score += [0, 100, 300, 500, 800][cleared]
      s.lines += cleared
      setScore(s.score)
    }
    s.piece = spawn()
    if (collide(s.piece.m, s.piece.x, s.piece.y)) {
      s.over = true
      setOver(true)
      report(s.score)
    }
  }

  const drop = () => {
    const s = st.current
    if (s.over) return
    if (!collide(s.piece.m, s.piece.x, s.piece.y + 1)) s.piece.y += 1
    else lock()
    draw()
  }

  const shift = (dx) => {
    const s = st.current
    if (s.over) return
    if (!collide(s.piece.m, s.piece.x + dx, s.piece.y)) s.piece.x += dx
    draw()
  }

  const rotate = () => {
    const s = st.current
    if (s.over) return
    const m = rot(s.piece.m)
    for (const kick of [0, -1, 1, -2, 2]) {
      if (!collide(m, s.piece.x + kick, s.piece.y)) {
        s.piece.m = m
        s.piece.x += kick
        break
      }
    }
    draw()
  }

  const hardDrop = () => {
    const s = st.current
    if (s.over) return
    while (!collide(s.piece.m, s.piece.x, s.piece.y + 1)) s.piece.y += 1
    lock()
    draw()
  }

  const loop = () => {
    drop()
    const speed = Math.max(120, 600 - st.current.lines * 25)
    timer.current = setTimeout(loop, speed)
  }

  const restart = () => {
    st.current = fresh()
    setScore(0)
    setOver(false)
    draw()
  }

  const onDir = (d) => {
    if (d === 'left') shift(-1)
    if (d === 'right') shift(1)
    if (d === 'down') drop()
    if (d === 'up') rotate()
  }

  useEffect(() => {
    draw()
    timer.current = setTimeout(loop, 600)
    const onKey = (e) => {
      const map = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ArrowDown: 'down', s: 'down', ArrowUp: 'up', w: 'up' }
      if (map[e.key]) {
        e.preventDefault()
        onDir(map[e.key])
      }
      if (e.key === ' ') {
        e.preventDefault()
        hardDrop()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(timer.current)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <GameFrame title="Tetris" score={score} best={best} onRestart={restart} hint="Arrows / WASD: move, ▲ rotates, Space hard-drops. On touch, use the pad (▲ = rotate).">
      <canvas ref={cv} className="game" width={W * B} height={H * B} />
      {over && <div className="overlay">Game over — hit Restart</div>}
      <Pad onDir={onDir} />
      <button className="btn" onPointerDown={hardDrop}>
        Hard drop
      </button>
    </GameFrame>
  )
}
