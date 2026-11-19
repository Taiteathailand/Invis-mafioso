import { useEffect, useRef, useState } from 'react'
import GameFrame from '../components/GameFrame'
import { useHighScore } from '../hooks'

const W = 560
const H = 280
const GROUND = 220
const SIZE = 28
const PX = 90

const fresh = () => ({ y: GROUND - SIZE, vy: 0, onGround: true, obs: [], dist: 0, speed: 5, next: 60, rot: 0, over: false, started: false })

// Original auto-runner: the cube moves on its own, you only time the jump.
export default function CubeDash() {
  const cv = useRef(null)
  const st = useRef(fresh())
  const [score, setScore] = useState(0)
  const [over, setOver] = useState(false)
  const [best, report] = useHighScore('cubedash')

  const draw = () => {
    const ctx = cv.current.getContext('2d')
    const s = st.current
    ctx.fillStyle = '#0d0d12'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#d4af37'
    ctx.fillRect(0, GROUND, W, 4)
    s.obs.forEach((o) => {
      if (o.type === 'spike') {
        ctx.fillStyle = '#c0392b'
        ctx.beginPath()
        ctx.moveTo(o.x, GROUND)
        ctx.lineTo(o.x + o.w / 2, GROUND - o.h)
        ctx.lineTo(o.x + o.w, GROUND)
        ctx.fill()
      } else {
        ctx.fillStyle = '#6c5ce7'
        ctx.fillRect(o.x, GROUND - o.h, o.w, o.h)
      }
    })
    ctx.save()
    ctx.translate(PX + SIZE / 2, s.y + SIZE / 2)
    ctx.rotate(s.rot)
    ctx.fillStyle = '#f3d77a'
    ctx.fillRect(-SIZE / 2, -SIZE / 2, SIZE, SIZE)
    ctx.fillStyle = '#111'
    ctx.fillRect(-6, -6, 4, 4)
    ctx.fillRect(4, -6, 4, 4)
    ctx.restore()
    if (!s.started) {
      ctx.fillStyle = '#fff'
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Tap / Space / Click to jump', W / 2, 90)
    }
  }

  const jump = () => {
    const s = st.current
    if (s.over) return
    s.started = true
    if (s.onGround) {
      s.vy = -10.5
      s.onGround = false
    }
  }

  const step = () => {
    const s = st.current
    if (s.over || !s.started) {
      draw()
      return
    }
    s.dist += s.speed
    s.speed = Math.min(9, 5 + s.dist / 4000)
    s.vy += 0.6
    s.y += s.vy
    if (s.y >= GROUND - SIZE) {
      s.y = GROUND - SIZE
      s.vy = 0
      s.onGround = true
      s.rot = 0
    } else {
      s.rot += 0.12
    }
    s.next -= s.speed
    if (s.next <= 0) {
      const r = Math.random()
      if (r < 0.55) s.obs.push({ type: 'spike', x: W, w: 28, h: 28 })
      else if (r < 0.85) s.obs.push({ type: 'block', x: W, w: 30, h: 30 })
      else {
        s.obs.push({ type: 'spike', x: W, w: 28, h: 28 })
        s.obs.push({ type: 'spike', x: W + 28, w: 28, h: 28 })
      }
      s.next = 190 + Math.random() * 170
    }
    s.obs.forEach((o) => (o.x -= s.speed))
    s.obs = s.obs.filter((o) => o.x > -80)
    // hitboxes: spikes are forgiving, blocks are solid
    const hit = s.obs.some((o) => {
      const inset = o.type === 'spike' ? 7 : 2
      return PX + SIZE - 3 > o.x + inset && PX + 3 < o.x + o.w - inset && s.y + SIZE - 2 > GROUND - o.h + (o.type === 'spike' ? 8 : 0)
    })
    const sc = Math.floor(s.dist / 50)
    setScore(sc)
    if (hit) {
      s.over = true
      setOver(true)
      report(sc)
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
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault()
        jump()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearInterval(id)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <GameFrame title="Cube Dash" score={score} best={best} onRestart={restart} hint="Click, tap or press Space to jump over spikes and blocks. It speeds up as you go.">
      <canvas ref={cv} className="game" width={W} height={H} onPointerDown={jump} />
      {over && <div className="overlay">Crashed — hit Restart</div>}
    </GameFrame>
  )
}
