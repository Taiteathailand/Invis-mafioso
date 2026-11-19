import { useEffect, useRef, useState } from 'react'
import GameFrame from '../components/GameFrame'
import Pad from '../components/Pad'
import { useHighScore } from '../hooks'

const N = 20
const S = 20
const D = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }
const fresh = () => ({
  snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
  dir: D.right,
  next: D.right,
  food: { x: 15, y: 10 },
  score: 0,
  over: false,
})

export default function Snake() {
  const cv = useRef(null)
  const st = useRef(fresh())
  const [score, setScore] = useState(0)
  const [over, setOver] = useState(false)
  const [best, report] = useHighScore('snake')

  const turn = (name) => {
    const d = D[name]
    const c = st.current.dir
    if (d.x + c.x !== 0 || d.y + c.y !== 0) st.current.next = d
  }

  const draw = () => {
    const ctx = cv.current.getContext('2d')
    ctx.fillStyle = '#0d0d12'
    ctx.fillRect(0, 0, N * S, N * S)
    const s = st.current
    ctx.fillStyle = '#c0392b'
    ctx.fillRect(s.food.x * S + 2, s.food.y * S + 2, S - 4, S - 4)
    s.snake.forEach((p, i) => {
      ctx.fillStyle = i ? '#d4af37' : '#f3d77a'
      ctx.fillRect(p.x * S + 1, p.y * S + 1, S - 2, S - 2)
    })
  }

  const placeFood = () => {
    const s = st.current
    for (let tries = 0; tries < 500; tries++) {
      const f = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) }
      if (!s.snake.some((p) => p.x === f.x && p.y === f.y)) {
        s.food = f
        return
      }
    }
  }

  const tick = () => {
    const s = st.current
    if (s.over) return
    s.dir = s.next
    const h = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y }
    if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || s.snake.some((p) => p.x === h.x && p.y === h.y)) {
      s.over = true
      setOver(true)
      report(s.score)
      draw()
      return
    }
    s.snake.unshift(h)
    if (h.x === s.food.x && h.y === s.food.y) {
      s.score += 10
      setScore(s.score)
      placeFood()
    } else {
      s.snake.pop()
    }
    draw()
  }

  const restart = () => {
    st.current = fresh()
    setScore(0)
    setOver(false)
    draw()
  }

  useEffect(() => {
    draw()
    const id = setInterval(tick, 110)
    const keys = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' }
    const onKey = (e) => {
      const k = keys[e.key]
      if (k) {
        e.preventDefault()
        turn(k)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearInterval(id)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <GameFrame title="Snake" score={score} best={best} onRestart={restart} hint="Arrow keys / WASD, or use the on-screen pad.">
      <canvas ref={cv} className="game" width={N * S} height={N * S} />
      {over && <div className="overlay">Game over — hit Restart</div>}
      <Pad onDir={turn} />
    </GameFrame>
  )
}
