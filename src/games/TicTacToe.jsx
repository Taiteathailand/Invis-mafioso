import { useState } from 'react'
import GameFrame from '../components/GameFrame'
import { useHighScore } from '../hooks'

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

const winner = (b) => {
  for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a]
  return b.every(Boolean) ? 'draw' : null
}

// Minimax: AI is 'O', human is 'X'
const minimax = (b, turn) => {
  const w = winner(b)
  if (w === 'O') return { score: 1 }
  if (w === 'X') return { score: -1 }
  if (w === 'draw') return { score: 0 }
  let bestMove = null
  let bestScore = turn === 'O' ? -2 : 2
  b.forEach((v, i) => {
    if (v) return
    const nb = [...b]
    nb[i] = turn
    const { score } = minimax(nb, turn === 'O' ? 'X' : 'O')
    if (turn === 'O' ? score > bestScore : score < bestScore) {
      bestScore = score
      bestMove = i
    }
  })
  return { score: bestScore, move: bestMove }
}

const aiMove = (b) => {
  const free = b.map((v, i) => (v ? null : i)).filter((v) => v !== null)
  // 25% of the time the AI plays randomly so you can actually win
  if (Math.random() < 0.25) return free[Math.floor(Math.random() * free.length)]
  return minimax(b, 'O').move
}

export default function TicTacToe() {
  const [b, setB] = useState(Array(9).fill(null))
  const [wins, setWins] = useState(0)
  const [status, setStatus] = useState('Your move (X)')
  const [done, setDone] = useState(false)
  const [best, report] = useHighScore('tictactoe')

  const play = (i) => {
    if (done || b[i]) return
    let nb = [...b]
    nb[i] = 'X'
    let w = winner(nb)
    if (!w) {
      nb[aiMove(nb)] = 'O'
      w = winner(nb)
    }
    setB(nb)
    if (w) {
      setDone(true)
      if (w === 'X') {
        const n = wins + 1
        setWins(n)
        report(n)
        setStatus('You win! 🎉')
      } else if (w === 'O') setStatus('Computer wins')
      else setStatus('Draw')
    }
  }

  const again = () => {
    setB(Array(9).fill(null))
    setDone(false)
    setStatus('Your move (X)')
  }

  return (
    <GameFrame title="Tic-Tac-Toe" score={wins} best={best} scoreLabel="Wins" bestLabel="Best wins" onRestart={() => { again(); setWins(0) }}>
      <div>{status}</div>
      <div className="board" style={{ gridTemplateColumns: 'repeat(3, 90px)' }}>
        {b.map((v, i) => (
          <button key={i} className="cell" style={{ width: 90, height: 90 }} onClick={() => play(i)}>
            {v}
          </button>
        ))}
      </div>
      {done && (
        <button className="btn gold" onClick={again}>
          Next round
        </button>
      )}
    </GameFrame>
  )
}
