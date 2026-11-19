import { useEffect, useRef, useState } from 'react'
import GameFrame from '../components/GameFrame'
import { useHighScore } from '../hooks'

const W = 480
const H = 320
const PH = 60

const fresh = () => ({
  py: H / 2 - PH / 2,
  ay: H / 2 - PH / 2,
  bx: W / 2,
  by: H / 2,
  vx: 4 * (Math.random() < 0.5 ? 1 : -1),
  vy: 2.5,
  up: false,
  down: false,
  target: null,
  ps: 0,
  as: 0,
  over: false,
})

export default function Pong() {
  const cv = useRef(null)
  const st = useRef(fresh())
  const [score, setScore] = useState(0)
  const [aiScore, setAiScore] = useState(0)
  const [over, setOver] = useState(false)
  const [best, report] = useHighScore('pong')

  const serve = (dir) => {
    const s = st.current
    s.bx = W / 2
    s.by = H / 2
    s.vx = 4 * dir
    s.vy = (Math.random() - 0.5) * 5
  }

  const draw = () => {
    const ctx = cv.current.getContext('2d')
    const s = st.current
    ctx.fillStyle = '#0d0d12'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = 'rgba(255,255,255,.15)'
    ctx.setLineDash([6, 8])
    ctx.beginPath()
    ctx.moveTo(W / 2, 0)
    ctx.lineTo(W / 2, H)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = '#f3d77a'
    ctx.fillRect(10, s.py, 10, PH)
    ctx.fillStyle = '#c0392b'
    ctx.fillRect(W - 20, s.ay, 10, PH)
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(s.bx, s.by, 6, 0, Math.PI * 2)
    ctx.fill()
  }

  const step = () => {
    const s = st.current
    if (s.over) return
    if (s.target !== null) {
      s.py += Math.max(-7, Math.min(7, s.target - s.py))
    } else {
      if (s.up) s.py -= 5
      if (s.down) s.py += 5
    }
    s.py = Math.max(0, Math.min(H - PH, s.py))
    const aim = s.by - (s.ay + PH / 2)
    s.ay += Math.max(-3.2, Math.min(3.2, aim))
    s.ay = Math.max(0, Math.min(H - PH, s.ay))

    s.bx += s.vx
    s.by += s.vy
    if (s.by < 6 || s.by > H - 6) s.vy = -s.vy

    if (s.vx < 0 && s.bx <= 20 && s.bx >= 8 && s.by >= s.py && s.by <= s.py + PH) {
      s.vx = Math.min(9, -s.vx * 1.05)
      s.vy += (s.by - (s.py + PH / 2)) * 0.12
    }
    if (s.vx > 0 && s.bx >= W - 20 && s.bx <= W - 8 && s.by >= s.ay && s.by <= s.ay + PH) {
      s.vx = -Math.min(9, s.vx * 1.05)
    }
    if (s.bx < 0) {
      s.as += 1
      setAiScore(s.as)
      serve(1)
    } else if (s.bx > W) {
      s.ps += 1
      setScore(s.ps)
      serve(-1)
    }
    if (s.as >= 5) {
      s.over = true
      setOver(true)
      report(s.ps)
    }
    draw()
  }

  const restart = () => {
    st.current = fresh()
    setScore(0)
    setAiScore(0)
    setOver(false)
    draw()
  }

  const onPointer = (e) => {
    const r = cv.current.getBoundingClientRect()
    st.current.target = (e.clientY - r.top) * (H / r.height) - PH / 2
  }

  useEffect(() => {
    draw()
    const id = setInterval(step, 16)
    const down = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault()
        st.current.target = null
        st.current.up = true
      }
      if (e.key === 'ArrowDown' || e.key === 's') {
        e.preventDefault()
        st.current.target = null
        st.current.down = true
      }
    }
    const up = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w') st.current.up = false
      if (e.key === 'ArrowDown' || e.key === 's') st.current.down = false
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
    <GameFrame
      title="Pong"
      score={score}
      best={best}
      onRestart={restart}
      hint="Move with mouse/touch over the court, or W/S and arrow keys. Game ends when the AI scores 5."
    >
      <div>
        You {score} — AI {aiScore}
      </div>
      <canvas ref={cv} className="game" width={W} height={H} onPointerMove={onPointer} onPointerDown={onPointer} />
      {over && <div className="overlay">Game over — hit Restart</div>}
    </GameFrame>
  )
}
