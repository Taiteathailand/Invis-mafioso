import { useEffect, useState } from 'react'
import GameFrame from '../components/GameFrame'
import { useHighScore } from '../hooks'

const ICONS = ['🍕', '🎲', '🚗', '🐙', '🎧', '🔥', '💎', '🌵']
const deal = () =>
  [...ICONS, ...ICONS]
    .map((v) => ({ v, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map((o, i) => ({ id: i, v: o.v }))

export default function Memory() {
  const [cards, setCards] = useState(deal)
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [best, report] = useHighScore('memory', true)

  useEffect(() => {
    if (flipped.length !== 2) return
    const [a, b] = flipped
    setMoves((m) => m + 1)
    if (cards[a].v === cards[b].v) {
      setMatched((m) => [...m, a, b])
      setFlipped([])
    } else {
      const t = setTimeout(() => setFlipped([]), 700)
      return () => clearTimeout(t)
    }
  }, [flipped])

  useEffect(() => {
    if (matched.length === cards.length && moves > 0) report(moves)
  }, [matched])

  const click = (i) => {
    if (flipped.length >= 2 || flipped.includes(i) || matched.includes(i)) return
    setFlipped((f) => [...f, i])
  }

  const restart = () => {
    setCards(deal())
    setFlipped([])
    setMatched([])
    setMoves(0)
  }

  const won = matched.length === cards.length

  return (
    <GameFrame title="Memory Match" score={moves} best={best} scoreLabel="Moves" bestLabel="Fewest moves" onRestart={restart}>
      <div className="board" style={{ gridTemplateColumns: 'repeat(4, 76px)' }}>
        {cards.map((c, i) => {
          const show = flipped.includes(i) || matched.includes(i)
          return (
            <button key={c.id} className="cell" style={{ width: 76, height: 76 }} onClick={() => click(i)}>
              {show ? c.v : '♠'}
            </button>
          )
        })}
      </div>
      {won && <div className="overlay">You won in {moves} moves!</div>}
    </GameFrame>
  )
}
