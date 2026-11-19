import { Link } from 'react-router-dom'
import { GAMES } from '../games'

export default function Arcade() {
  return (
    <div>
      <div className="page-head">
        <h1>🕹️ Game Arcade</h1>
        <p className="mut">{GAMES.length} classics that run right in your browser. High scores save on this device.</p>
      </div>
      <div className="grid">
        {GAMES.map((g) => {
          let best = null
          try {
            best = localStorage.getItem('hs:' + g.id)
          } catch {}
          return (
            <Link key={g.id} to={`/arcade/${g.id}`} className="card link">
              <div className="big">{g.icon}</div>
              <h3>{g.name}</h3>
              <p className="mut" style={{ margin: '0 0 8px' }}>{g.desc}</p>
              {best !== null && <span className="badge">Best: {best}</span>}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
