import { useState } from 'react'
import { useLocalStorage } from '../hooks'

// Roblox's own APIs block requests from other websites, so this hub links out
// to the official Roblox site instead of loading game data directly.
const search = (q) => `https://www.roblox.com/discover/?Keyword=${encodeURIComponent(q)}`

const POPULAR = [
  { name: 'Adopt Me!', genre: 'Pets / Roleplay', info: 'Hatch, raise and trade pets in a huge social world.' },
  { name: 'Brookhaven RP', genre: 'Roleplay', info: 'Open-ended town roleplay with houses, cars and jobs.' },
  { name: 'Blox Fruits', genre: 'Action RPG', info: 'Sail the seas, level up and hunt for powerful fruits.' },
  { name: 'Murder Mystery 2', genre: 'Social deduction', info: 'One murderer, one sheriff, everyone else tries to survive.' },
  { name: 'Dress to Impress', genre: 'Fashion', info: 'Themed outfit rounds judged by other players.' },
  { name: 'Tower of Hell', genre: 'Obby', info: 'Randomised obstacle tower with no checkpoints.' },
  { name: 'DOORS', genre: 'Horror', info: 'Survive a haunted hotel one room at a time.' },
  { name: 'Grow a Garden', genre: 'Simulator', info: 'Plant, grow and sell crops while trading with friends.' },
]

const LINKS = [
  ['Roblox website', 'https://www.roblox.com/'],
  ['Download Roblox (official)', 'https://www.roblox.com/download'],
  ['Charts: top experiences', 'https://www.roblox.com/charts'],
  ['Roblox news & newsroom', 'https://corp.roblox.com/newsroom'],
  ['Roblox Support', 'https://en.help.roblox.com/'],
  ['Roblox Creator Hub', 'https://create.roblox.com/'],
]

export default function RobloxHub() {
  const [q, setQ] = useState('')
  const [favs, setFavs] = useLocalStorage('roblox-favs', [])
  const [custom, setCustom] = useState('')

  const toggle = (name) => setFavs((f) => (f.includes(name) ? f.filter((x) => x !== name) : [...f, name]))
  const submit = (e) => {
    e.preventDefault()
    if (q.trim()) window.open(search(q.trim()), '_blank', 'noopener')
  }
  const addCustom = (e) => {
    e.preventDefault()
    const n = custom.trim()
    if (n && !favs.includes(n)) setFavs([...favs, n])
    setCustom('')
  }

  return (
    <div>
      <div className="page-head">
        <h1>🧱 Roblox Hub</h1>
        <p className="mut">Find experiences, keep a favorites list, and jump to the official Roblox site. Playing happens in the Roblox app or website.</p>
      </div>

      <form className="row" onSubmit={submit} style={{ marginBottom: 18 }}>
        <input style={{ flex: 1, minWidth: 220 }} placeholder="Search Roblox experiences…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn gold">Search on Roblox ↗</button>
      </form>

      <h2>⭐ Your favorites</h2>
      <form className="row" onSubmit={addCustom} style={{ marginBottom: 10 }}>
        <input placeholder="Add a game name…" value={custom} onChange={(e) => setCustom(e.target.value)} />
        <button className="btn">Add</button>
      </form>
      {favs.length === 0 ? (
        <p className="mut">No favorites yet. Tap ☆ on a game below or add one above.</p>
      ) : (
        <div className="grid" style={{ marginBottom: 20 }}>
          {favs.map((f) => (
            <div key={f} className="card">
              <h3>{f}</h3>
              <div className="row">
                <a className="btn sm" href={search(f)} target="_blank" rel="noopener noreferrer">Find on Roblox ↗</a>
                <button className="btn sm" onClick={() => toggle(f)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2>🔥 Popular experiences</h2>
      <div className="grid" style={{ marginBottom: 20 }}>
        {POPULAR.map((g) => (
          <div key={g.name} className="card">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>{g.name}</h3>
              <button className="btn sm" onClick={() => toggle(g.name)} aria-label="Toggle favorite">
                {favs.includes(g.name) ? '⭐' : '☆'}
              </button>
            </div>
            <span className="badge">{g.genre}</span>
            <p className="mut">{g.info}</p>
            <a className="btn sm" href={search(g.name)} target="_blank" rel="noopener noreferrer">Find on Roblox ↗</a>
          </div>
        ))}
      </div>

      <h2>🔗 Official links & news</h2>
      <div className="row">
        {LINKS.map(([label, url]) => (
          <a key={url} className="btn" href={url} target="_blank" rel="noopener noreferrer">{label} ↗</a>
        ))}
      </div>
      <p className="note" style={{ marginTop: 16 }}>
        Popularity and game details change often, so the descriptions here are a starting point. Check the official Roblox charts for what is trending right now.
      </p>
    </div>
  )
}
