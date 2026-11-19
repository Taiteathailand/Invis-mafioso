import { useEffect, useRef, useState } from 'react'
import GameFrame from '../components/GameFrame'
import { useHighScore } from '../hooks'

const W = 320
const H = 480
const GAP = 130
const BX = 80

const fresh = () => ({ y: H / 2, vy: 0, pipes: [], frame: 0, score: 0, over: false, started: false })

export default function Flappy() {
  const cv = useRef(null)
  const st = useRef(fresh())
  const [score, setScore] = useState(0)
  const [over, setOver] = useState(false)
  const [best, report] = useHighScore('flappy')

  const draw = () => {
    const ctx = cv.current.getContext('2d')
    const s = st.current
    ctx.fillStyle = '#0d0d12'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#27ae60'
    s.pipes.forEach((p) => {
      ctx.fillRect(p.x, 0, 50, p.gap)
      ctx.fillRect(p.x, p.gap + GAP, 50, H - p.gap - GAP)
    })
    ctx.fillStyle = '#f3d77a'
    ctx.beginPath()
    ctx.arc(BX, s.y, 12, 0, Math.PI * 2)
    ctx.fill()
    if (!s.started) {
      ctx.fillStyle = '#fff'
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Tap / Space to flap', W / 2, H / 2 - 40)
    }
  }

  const flap = () => {
    const s = st.current
    if (s.over) return
    s.started = true
    s.vy = -7
  }

  const step = () => {
    const s = st.current
    if (s.over || !s.started) {
      draw()
      return
    }
    s.frame += 1
    s.vy += 0.45
    s.y += s.vy
    if (s.frame % 90 === 1) s.pipes.push({ x: W, gap: 60 + Math.random() * (H - GAP - 120), passed: false })
    s.pipes.forEach((p) => {
      p.x -= 2.4
      if (!p.passed && p.x + 50 < BX) {
        p.passed = true
        s.score += 1
        setScore(s.score)
      }
    })
    s.pipes = s.pipes.filter((p) => p.x > -60)
    const hit = s.pipes.some((p) => BX + 12 > p.x && BX - 12 < p.x + 50 && (s.y - 12 < p.gap || s.y + 12 > p.gap + GAP))
    if (hit || s.y > H || s.y < 0) {
      s.over = true
      setOver(true)
      report(s.score)
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
    const id = setInterval(step, 16)
    const onKey = (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault()
        flap()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearInterval(id)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <GameFrame title="Flappy" score={score} best={best} onRestart={restart} hint="Click / tap the game or press Space to flap.">
      <canvas ref={cv} className="game" width={W} height={H} onPointerDown={flap} />
      {over && <div className="overlay">Game over — hit Restart</div>}
    </GameFrame>
  )
}
