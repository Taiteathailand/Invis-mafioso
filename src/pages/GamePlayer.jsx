
import { useParams, Link } from 'react-router-dom'

const EMBED_GAMES = {
  'snow-rider-3d': {
    name: 'Snow Rider 3D',
    url: 'https://snowrider.com/',
  },
}

export default function GamePlayer() {
  const { id } = useParams()
  const game = EMBED_GAMES[id]

  if (!game) {
    return (
      <div className="card">
        <h2>Game not available</h2>
        <Link className="btn gold" to="/arcade">
          Back to Arcade
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2>{game.name}</h2>
        <Link className="btn gold" to="/arcade">
          ← Back to Arcade
        </Link>
      </div>

      <div
        className="card"
        style={{ padding: 8, overflow: 'hidden' }}
      >
        <iframe
          src={game.url}
          title={game.name}
          allow="fullscreen; autoplay; gamepad"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          style={{
            width: '100%',
            height: '75vh',
            border: 0,
            borderRadius: 10,
            background: '#000',
          }}
        />
      </div>
    </div>
  )
}

