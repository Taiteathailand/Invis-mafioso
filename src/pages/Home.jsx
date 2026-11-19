import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GAMES, gameById } from '../games'
import { useLocalStorage } from '../hooks'

const WIDGETS = [
  ['featured', 'Featured games'],
  ['recent', 'Recently played'],
  ['shortcuts', 'Shortcuts'],
  ['news', 'Notifications'],
  ['clock', 'Clock'],
  ['notes', 'Quick notes'],
]

const NEWS = [
  '♠ Welcome to INVIS MAFIOSO. Everything here runs in your browser.',
  '🕹️ 11 arcade games are live. Try Tetris or 2048.',
  '⛏️ Minecraft hub searches Modrinth for mods, packs, shaders and more.',
  '🖥️ Open the Desktop tab for draggable windows and mini apps.',
]

function Clock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div>
      <div style={{ fontSize: '2rem', color: 'var(--gold2)' }}>{now.toLocaleTimeString()}</div>
      <div className="mut">{now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
    </div>
  )
}

function Widget({ show, title, children }) {
  if (!show) return null
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  )
}

export default function Home() {
  const [on, setOn] = useLocalStorage('widgets', { featured: true, recent: true, shortcuts: true, news: true, clock: true, notes: true })
  const [recent] = useLocalStorage('recent', [])
  const [notes, setNotes] = useLocalStorage('home-notes', '')
  const [edit, setEdit] = useState(false)
  const featured = GAMES.slice(0, 4)

  return (
    <div>
      <div className="page-head row" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1>♠ INVIS MAFIOSO</h1>
          <p className="mut">Your games, Roblox, Minecraft and more in one place.</p>
        </div>
        <button className="btn" onClick={() => setEdit((e) => !e)}>
          {edit ? 'Done' : '⚙️ Customize'}
        </button>
      </div>

      {edit && (
        <div className="card" style={{ marginBottom: 14 }}>
          <h2>Show or hide widgets</h2>
          <div className="row">
            {WIDGETS.map(([k, label]) => (
              <label key={k} className="row" style={{ gap: 6 }}>
                <input type="checkbox" checked={!!on[k]} onChange={() => setOn({ ...on, [k]: !on[k] })} />
                {label}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        <Widget show={on.featured} title="Featured games">
          <div className="row">
            {featured.map((g) => (
              <Link key={g.id} to={`/arcade/${g.id}`} className="btn">
                {g.icon} {g.name}
              </Link>
            ))}
          </div>
        </Widget>

        <Widget show={on.recent} title="Recently played">
          {recent.length === 0 ? (
            <p className="mut">Nothing yet. Play something from the Arcade.</p>
          ) : (
            <div className="row">
              {recent.map((id) => {
                const g = gameById(id)
                return g ? (
                  <Link key={id} to={`/arcade/${id}`} className="btn">
                    {g.icon} {g.name}
                  </Link>
                ) : null
              })}
            </div>
          )}
        </Widget>

        <Widget show={on.shortcuts} title="Shortcuts">
          <div className="row">
            <Link to="/roblox" className="btn">🧱 Roblox Hub</Link>
            <Link to="/minecraft" className="btn">⛏️ Minecraft Hub</Link>
            <Link to="/social" className="btn">💬 Social</Link>
            <Link to="/desktop" className="btn">🖥️ Desktop</Link>
          </div>
        </Widget>

        <Widget show={on.news} title="Notifications">
          {NEWS.map((n, i) => (
            <p key={i} style={{ margin: '6px 0' }}>{n}</p>
          ))}
        </Widget>

        <Widget show={on.clock} title="Clock">
          <Clock />
        </Widget>

        <Widget show={on.notes} title="Quick notes">
          <textarea rows={5} style={{ width: '100%' }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Saved on this device…" />
        </Widget>
      </div>
    </div>
  )
}
