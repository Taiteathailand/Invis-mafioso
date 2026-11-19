import { useEffect, useRef, useState } from 'react'
import { GAMES } from '../games'
import { useLocalStorage } from '../hooks'

function NotesApp() {
  const [t, setT] = useLocalStorage('desk-notes', '')
  return <textarea rows={12} style={{ width: '100%' }} value={t} onChange={(e) => setT(e.target.value)} placeholder="Type here. Saved automatically." />
}

function CalcApp() {
  const [expr, setExpr] = useState('')
  const [shown, setShown] = useState('0')

  // Tiny safe calculator: evaluates "a op b op c" left to right, no eval().
  const compute = (s) => {
    const tokens = s.match(/-?\d*\.?\d+|[+\-*/]/g)
    if (!tokens) return 0
    let acc = parseFloat(tokens[0])
    for (let i = 1; i < tokens.length - 1; i += 2) {
      const n = parseFloat(tokens[i + 1])
      if (tokens[i] === '+') acc += n
      if (tokens[i] === '-') acc -= n
      if (tokens[i] === '*') acc *= n
      if (tokens[i] === '/') acc = n === 0 ? NaN : acc / n
    }
    return acc
  }
  const press = (k) => {
    if (k === 'C') {
      setExpr('')
      setShown('0')
    } else if (k === '=') {
      const r = compute(expr)
      const out = Number.isFinite(r) ? String(+r.toFixed(8)) : 'Error'
      setShown(out)
      setExpr(Number.isFinite(r) ? out : '')
    } else {
      const next = expr + k
      setExpr(next)
      setShown(next)
    }
  }
  const keys = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+']
  return (
    <div className="calc">
      <div className="disp">{shown}</div>
      {keys.map((k) => (
        <button key={k} onClick={() => press(k)}>{k}</button>
      ))}
      <button style={{ gridColumn: '1 / -1' }} onClick={() => press('C')}>Clear</button>
    </div>
  )
}

function ClockApp() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2.4rem', color: 'var(--gold2)' }}>{now.toLocaleTimeString()}</div>
      <div className="mut">{now.toDateString()}</div>
    </div>
  )
}

function GamesApp() {
  const [id, setId] = useState(null)
  const g = GAMES.find((x) => x.id === id)
  if (g) {
    const G = g.Component
    return (
      <div>
        <button className="btn sm" onClick={() => setId(null)}>← Games</button>
        <G />
      </div>
    )
  }
  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
      {GAMES.map((x) => (
        <button key={x.id} className="card link" style={{ cursor: 'pointer', color: 'inherit', font: 'inherit' }} onClick={() => setId(x.id)}>
          <div className="big">{x.icon}</div>
          {x.name}
        </button>
      ))}
    </div>
  )
}

function LinksApp() {
  return (
    <div className="row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <a className="btn" href="#/roblox">🧱 Roblox Hub</a>
      <a className="btn" href="#/minecraft">⛏️ Minecraft Hub</a>
      <a className="btn" href="#/arcade">🕹️ Arcade</a>
      <a className="btn" href="#/social">💬 Social</a>
    </div>
  )
}

const APPS = [
  { id: 'games', name: 'Arcade', icon: '🕹️', C: GamesApp },
  { id: 'notes', name: 'Notes', icon: '📝', C: NotesApp },
  { id: 'calc', name: 'Calculator', icon: '🧮', C: CalcApp },
  { id: 'clock', name: 'Clock', icon: '🕒', C: ClockApp },
  { id: 'links', name: 'Hubs', icon: '🧭', C: LinksApp },
]

function Win({ w, app, onFocus, onMove, onClose, onMin }) {
  const drag = useRef(null)
  const C = app.C
  return (
    <div className="win" style={{ left: w.x, top: w.y, zIndex: w.z, display: w.min ? 'none' : 'flex' }} onPointerDown={onFocus}>
      <div
        className="win-title"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          drag.current = { dx: e.clientX - w.x, dy: e.clientY - w.y }
        }}
        onPointerMove={(e) => {
          if (drag.current) onMove(Math.max(0, e.clientX - drag.current.dx), Math.max(0, e.clientY - drag.current.dy))
        }}
        onPointerUp={() => (drag.current = null)}
      >
        <b>{app.icon} {app.name}</b>
        <span>
          <button onClick={onMin} onPointerDown={(e) => e.stopPropagation()} aria-label="Minimize">–</button>
          <button onClick={onClose} onPointerDown={(e) => e.stopPropagation()} aria-label="Close">✕</button>
        </span>
      </div>
      <div className="win-body">
        <C />
      </div>
    </div>
  )
}

export default function Desktop() {
  const [wins, setWins] = useState([])
  const [menu, setMenu] = useState(false)
  const z = useRef(10)

  const open = (app) => {
    setMenu(false)
    setWins((ws) => {
      const ex = ws.find((x) => x.app === app.id)
      if (ex) return ws.map((x) => (x === ex ? { ...x, min: false, z: ++z.current } : x))
      return [...ws, { key: app.id + Date.now(), app: app.id, x: 100 + ws.length * 30, y: 20 + ws.length * 30, z: ++z.current, min: false }]
    })
  }
  const patch = (key, p) => setWins((ws) => ws.map((x) => (x.key === key ? { ...x, ...p } : x)))
  const focus = (key) => patch(key, { z: ++z.current })

  return (
    <div>
      <div className="page-head" style={{ marginBottom: 8 }}>
        <h1 style={{ margin: 0 }}>🖥️ Desktop</h1>
      </div>
      <div className="desk">
        <div className="desk-icons">
          {APPS.map((a) => (
            <button key={a.id} className="desk-icon" onDoubleClick={() => open(a)} onClick={() => open(a)}>
              <span>{a.icon}</span>
              {a.name}
            </button>
          ))}
        </div>

        {wins.map((w) => {
          const app = APPS.find((a) => a.id === w.app)
          return (
            <Win
              key={w.key}
              w={w}
              app={app}
              onFocus={() => focus(w.key)}
              onMove={(x, y) => patch(w.key, { x, y })}
              onClose={() => setWins((ws) => ws.filter((x) => x.key !== w.key))}
              onMin={() => patch(w.key, { min: true })}
            />
          )
        })}

        {menu && (
          <div className="start">
            {APPS.map((a) => (
              <button key={a.id} onClick={() => open(a)}>{a.icon} {a.name}</button>
            ))}
          </div>
        )}

        <div className="taskbar">
          <button className="btn gold sm" onClick={() => setMenu((m) => !m)}>♠ Start</button>
          {wins.map((w) => {
            const app = APPS.find((a) => a.id === w.app)
            return (
              <button key={w.key} className={'task' + (w.min ? ' min' : '')} onClick={() => patch(w.key, { min: !w.min, z: ++z.current })}>
                {app.icon} {app.name}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
