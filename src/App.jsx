
import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'

import Home from './pages/Home'
import RobloxHub from './pages/RobloxHub'
import MinecraftHub from './pages/MinecraftHub'
import Arcade from './pages/Arcade'
import Play from './pages/Play'
import GamePlayer from './pages/GamePlayer'
import Social from './pages/Social'
import Desktop from './pages/Desktop'

const NAV = [
  ['/', '🏠', 'Home'],
  ['/roblox', '🧱', 'Roblox'],
  ['/minecraft', '⛏️', 'Minecraft'],
  ['/arcade', '🕹️', 'Arcade'],
  ['/social', '💬', 'Social'],
  ['/desktop', '🖥️', 'Desktop'],
]

export default function App() {
  return (
    <HashRouter>
      <div className="app">
        <aside className="side">
          <div className="brand">
            ♠ INVIS
            <br />
            <span>MAFIOSO</span>
          </div>

          <nav>
            {NAV.map(([to, icon, label]) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  'nav' + (isActive ? ' on' : '')
                }
              >
                <span>{icon}</span>
                <b>{label}</b>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/roblox" element={<RobloxHub />} />
            <Route path="/minecraft" element={<MinecraftHub />} />

            <Route path="/arcade" element={<Arcade />} />
            <Route path="/arcade/:id" element={<Play />} />

            <Route path="/game/:id" element={<GamePlayer />} />

            <Route path="/social" element={<Social />} />
            <Route path="/desktop" element={<Desktop />} />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}
