import Snake from './Snake'
import Pong from './Pong'
import Breakout from './Breakout'
import TicTacToe from './TicTacToe'
import Memory from './Memory'
import Game2048 from './Game2048'
import Minesweeper from './Minesweeper'
import Connect4 from './Connect4'
import Flappy from './Flappy'
import Tetris from './Tetris'
import CubeDash from './CubeDash'

export const GAMES = [
  { id: 'snake', name: 'Snake', icon: '🐍', desc: 'Eat, grow, don’t crash.', Component: Snake },
  { id: 'tetris', name: 'Tetris', icon: '🧱', desc: 'Stack blocks, clear lines.', Component: Tetris },
  { id: 'pong', name: 'Pong', icon: '🏓', desc: 'Beat the AI to the punch.', Component: Pong },
  { id: 'breakout', name: 'Breakout', icon: '🧨', desc: 'Smash every brick.', Component: Breakout },
  { id: '2048', name: '2048', icon: '🔢', desc: 'Merge tiles to reach 2048.', Component: Game2048 },
  { id: 'minesweeper', name: 'Minesweeper', icon: '💣', desc: 'Find the mines, fast.', Component: Minesweeper },
  { id: 'tictactoe', name: 'Tic-Tac-Toe', icon: '❌', desc: 'You vs the computer.', Component: TicTacToe },
  { id: 'connect4', name: 'Connect 4', icon: '🔴', desc: 'Line up four to win.', Component: Connect4 },
  { id: 'memory', name: 'Memory Match', icon: '🃏', desc: 'Find all the pairs.', Component: Memory },
  { id: 'flappy', name: 'Flappy', icon: '🐤', desc: 'Tap to flap through pipes.', Component: Flappy },
  { id: 'cubedash', name: 'Cube Dash', icon: '🟨', desc: 'Auto-runner: time your jumps over spikes.', Component: CubeDash },
]

export const gameById = (id) => GAMES.find((g) => g.id === id)
