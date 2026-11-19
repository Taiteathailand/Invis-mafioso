import { useEffect, useRef, useState } from 'react'
import GameFrame from '../components/GameFrame'
import { useHighScore } from '../hooks'

const W = 480
const H = 360
const PW = 80
const ROWS = 5
const COLS = 10
const COLORS = ['#c0392b', '#e67e22', '#f1c40f', '#27ae60', '#2980b9']

const makeBricks = () => {
  const b = []
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) b.push({ x: 2 + c * 48, y: 30 + r * 20, w: 44, h: 16, r, alive: true })
  return b
}
const fresh = () => ({
  px: W / 2 - PW / 2,
  bx: W / 2,
  by: H - 40,
  vx: 3,
  vy: -3.5,
  bricks: makeBricks(),
  left: false,
  right: false,
  lives: 3,
  score: 0,
  over: false,
  level: 1,
})

export default function Breakout() {
  const cv = useRef(null)
  const st = useRef(fresh())
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [over, setOver] = useState(false)
  const [best, report] = useHighScore('breakout')

  const draw = () => {
    const ctx = cv.current.getContext('2d')
    const s = st.current
    ctx.fillStyle = '#0d0d12'
    ctx.fillRect(0, 0, W, H)
    s.bricks.forEach((b) => {
      if (!b.alive) return
      ctx.fillStyle = COLORS[b.r]
      ctx.fillRect(b.x, b.y, b.w, b.h)
    })
    ctx.fillStyle = '#f3d77a'
    ctx.fillRect(s.px, H - 16, PW, 10)
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(s.bx, s.by, 6, 0, Math.PI * 2)
    ctx.fill()
  }

  const resetBall = () => {
    const s = st.current
    s.bx = W / 2
    s.by = H - 40
    s.vx = 3 * (Math.random() < 0.5 ? 1 : -1)
    s.vy = -(3.5 + (s.level - 1) * 0.4)
  }

  const step = () => {
    const s = st.current
    if (s.over) return
    if (s.left) s.px -= 6
    if (s.right) s.px += 6
    s.px = Math.max(0, Math.min(W - PW, s.px))
    s.bx += s.vx
    s.by += s.vy
    if (s.bx < 6 || s.bx > W - 6) s.vx = -s.vx
    if (s.by < 6) s.vy = Math.abs(s.vy)
    if (s.vy > 0 && s.by >= H - 22 && s.by <= H - 6 && s.bx >= s.px && s.bx <= s.px + PW) {
      s.vy = -Math.abs(s.vy)
      s.vx = ((s.bx - (s.px + PW / 2)) / (PW / 2)) * 4.5
    }
    for (const b of s.bricks) {
      if (b.alive && s.bx > b.x - 6 && s.bx < b.x + b.w + 6 && s.by > b.y - 6 && s.by < b.y + b.h + 6) {
        b.alive = false
        s.vy = -s.vy
        s.score += 10
        setScore(s.score)
        break
      }
    }
    if (s.bricks.every((b) => !b.alive)) {
      s.level += 1
      s.bricks = makeBricks()
      resetBall()
    }
    if (s.by > H + 10) {
      s.lives -= 1
      setLives(s.lives)
      if (s.lives <= 0) {
        s.over = true
        setOver(true)
        report(s.score)
      } else resetBall()
    }
    draw()
  }

  const restart = () => {
    st.current = fresh()
    setScore(0)
    setLives(3)
    setOver(false)
    draw()
  }

  const onPointer = (e) => {
    const r = cv.current.getBoundingClientRect()
    st.current.px = (e.clientX - r.left) * (W / r.width) - PW / 2
  }

  useEffect(() => {
    draw()
    const id = setInterval(step, 16)
    const down = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        e.preventDefault()
        st.current.left = true
      }
      if (e.key === 'ArrowRight' || e.key === 'd') {
        e.preventDefault()
        st.current.right = true
      }
    }
    const up = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') st.current.left = false
      if (e.key === 'ArrowRight' || e.key === 'd') st.current.right = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      clearInterval(id)
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  return (
    <GameFrame title="Breakout" score={score} best={best} onRestart={restart} hint="Move the paddle with mouse/touch, or the left/right arrow keys.">
      <div>Lives: {'❤️'.repeat(Math.max(lives, 0))}</div>
      <canvas ref={cv} className="game" width={W} height={H} onPointerMove={onPointer} onPointerDown={onPointer} />
      {over && <div className="overlay">Game over — hit Restart</div>}
    </GameFrame>
  )
}
