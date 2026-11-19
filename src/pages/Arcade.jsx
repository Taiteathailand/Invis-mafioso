
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { GAMES } from '../games'

const EXTERNAL_GAMES = [
  {
    id: 'snow-rider-3d',
    name: 'Snow Rider 3D',
    icon: '🛷',
    desc: 'Race down a snowy mountain and dodge obstacles.',
    category: 'Racing',
    url: 'https://snowrider.com/',
  },
  {
    id: 'slope',
    name: 'Slope',
    icon: '🔴',
    desc: 'Roll down an endless neon track.',
    category: 'Racing',
    url: 'https://slopegame.com/',
  },
  {
    id: 'run-3',
    name: 'Run 3',
    icon: '🏃',
    desc: 'Run through space tunnels and avoid falling.',
    category: 'Platformer',
    url: 'https://www.coolmathgames.com/0-run-3',
  },
  {
    id: 'happy-wheels',
    name: 'Happy Wheels',
    icon: '🚴',
    desc: 'Navigate ridiculous obstacle courses.',
    category: 'Action',
    url: 'https://totaljerkface.com/happy_wheels.t6',
  },
  {
    id: 'pacman',
    name: 'PAC-MAN',
    icon: '🟡',
    desc: 'The classic maze game.',
    category: 'Classic',
    url: 'https://www.pacman.com/en/',
  },
  {
    id: 'geometry-dash-lite',
    name: 'Geometry Dash Lite',
    icon: '🟨',
    desc: 'Jump, dodge obstacles and beat the levels.',
    category: 'Platformer',
    url: 'https://geometrylitepc.net/',
  },
]

const CATEGORIES = [
  'All Games',
  'Racing',
  'Puzzle',
  'Classic',
  'Platformer',
  'Action',
  'Favorites',
]

const GAME_CATEGORIES = {
  snake: 'Classic',
  tetris: 'Puzzle',
  pong: 'Classic',
  breakout: 'Classic',
  '2048': 'Puzzle',
  minesweeper: 'Puzzle',
  tictactoe: 'Classic',
  connect4: 'Classic',
  memory: 'Puzzle',
  flappy: 'Platformer',
  cubedash: 'Platformer',
}

export default function Arcade() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All Games')

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('arcade-favorites') || '[]')
    } catch {
      return []
    }
  })

  function toggleFavorite(id) {
    setFavorites((old) => {
      const next = old.includes(id)
        ? old.filter((x) => x !== id)
        : [...old, id]

      localStorage.setItem('arcade-favorites', JSON.stringify(next))
      return next
    })
  }

  const games = useMemo(() => {
    const builtIn = GAMES.map((g) => ({
      ...g,
      category: GAME_CATEGORIES[g.id] || 'Classic',
      external: false,
    }))

    const external = EXTERNAL_GAMES.map((g) => ({
      ...g,
      external: true,
    }))

    return [...builtIn, ...external].filter((g) => {
      const term = search.toLowerCase()

      const matchesSearch =
        g.name.toLowerCase().includes(term) ||
        g.desc.toLowerCase().includes(term) ||
        g.category.toLowerCase().includes(term)

      const matchesCategory =
        category === 'All Games' ||
        (category === 'Favorites'
          ? favorites.includes(g.id)
          : g.category === category)

      return matchesSearch && matchesCategory
    })
  }, [search, category, favorites])

  return (
    <div>
      <div className="page-head">
        <h1>🕹️ INVIS MAFIOSO ARCADE</h1>
        <p className="mut">
          Your collection of classics, browser games and more.
        </p>
      </div>

      <div className="row" style={{ marginBottom: 16 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔎 Search games..."
          style={{ flex: 1, minWidth: 220 }}
        />
        <span className="badge">{games.length} games found</span>
      </div>

      <div className="tabs">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={'tab' + (category === c ? ' on' : '')}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid">
        {games.map((g) => (
          <div key={g.id} className="card link">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div className="big">{g.icon}</div>

              <button
                className="btn sm"
                onClick={() => toggleFavorite(g.id)}
                aria-label="Toggle favorite"
              >
                {favorites.includes(g.id) ? '⭐' : '☆'}
              </button>
            </div>

            <h3>{g.name}</h3>
            <p className="mut">{g.desc}</p>

            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="badge">{g.category}</span>

              {g.external ? (
                <Link className="btn gold" to={`/game/${g.id}`}>
                  Play
                </Link>
              ) : (
                <Link className="btn gold" to={`/arcade/${g.id}`}>
                  Play
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {games.length === 0 && (
        <div className="card">
          <h3>No games found</h3>
          <p className="mut">
            Try another search or category.
          </p>
        </div>
      )}
    </div>
  )
}
