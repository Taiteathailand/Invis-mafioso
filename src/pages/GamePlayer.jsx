
import { useParams, Link } from 'react-router-dom'

const EMBED_GAMES = {
  'snow-rider-3d': {
    name: 'Snow Rider 3D',
    url: 'https://snowrider.com/',
  },
  slope: {
    name: 'Slope',
    url: 'https://slopegame.com/',
  },
  'run-3': {
    name: 'Run 3',
    url: 'https://www.coolmathgames.com/0-run-3',
  },
  'happy-wheels': {
    name: 'Happy Wheels',
    url: 'https://totaljerkface.com/happy_wheels.t6',
  },
  pacman: {
    name: 'PAC-MAN',
    url: 'https://www.pacman.com/en/',
  },
  'geometry-dash-lite': {
    name: 'Geometry Dash Lite',
    url: 'https://geometrylitepc.net/',
  },
}

export default function GamePlayer() {
  const { id } = useParams()
  const game = EMBED_GAMES[id]

  if (!game) {
    return (
      <div className="card">
        <h2>Game not found</h2>
        <Link className="btn gold" to="/arcade">
          ← Back to Arcade
        </Link>
      </div>
    )
  }

  return (
    <div className="game-player">
      <div
        className="row"
        style={{
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1>{game.name}</h1>
          <p className="mut">INVIS MAFIOSO GAME PLAYER</p>
        </div>

        <Link className="btn gold" to="/arcade">
          ← Back to Arcade
        </Link>
      </div>

      <div
        className="card"
        style={{
          padding: 8,
          overflow: 'hidden',
          background: '#050505',
        }}
      >
        <iframe
          key={game.url}
          src={game.url}
          title={game.name}
          allow="fullscreen; autoplay; gamepad"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          style={{
            display: 'block',
            width: '100%',
            height: '75vh',
            minHeight: 450,
            border: 'none',
            borderRadius: 10,
            background: '#000',
          }}
        />
      </div>

      <p className="mut" style={{ marginTop: 12 }}>
        If the game does not load, its hosting website may not allow
        embedding. The player cannot override that restriction.
      </p>
    </div>
  )
}
