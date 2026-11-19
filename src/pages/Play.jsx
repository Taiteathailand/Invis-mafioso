import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { gameById } from '../games'
import { useLocalStorage } from '../hooks'

export default function Play() {
  const { id } = useParams()
  const game = gameById(id)
  const [, setRecent] = useLocalStorage('recent', [])

  useEffect(() => {
    if (game) setRecent((r) => [game.id, ...r.filter((x) => x !== game.id)].slice(0, 6))
  }, [id])

  if (!game) {
    return (
      <div>
        <p>Game not found.</p>
        <Link to="/arcade">Back to the arcade</Link>
      </div>
    )
  }
  const G = game.Component
  return (
    <div>
      <p>
        <Link to="/arcade">← All games</Link>
      </p>
      <G key={game.id} />
    </div>
  )
}
