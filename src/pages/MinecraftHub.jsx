import { useEffect, useState } from 'react'

const TABS = [
  ['mod', '🧩 Mods'],
  ['modpack', '📦 Modpacks'],
  ['resourcepack', '🎨 Resource packs'],
  ['shader', '✨ Shaders'],
  ['skins', '🧍 Skins'],
  ['servers', '🌐 Servers'],
  ['learn', '📚 Tutorials'],
  ['launchers', '🚀 Versions & launchers'],
]
const LIVE = ['mod', 'modpack', 'resourcepack', 'shader']

const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(n))

// Live search against Modrinth's public API (a legitimate source of mods and packs).
function ModrinthSearch({ type }) {
  const [q, setQ] = useState('')
  const [version, setVersion] = useState('')
  const [hits, setHits] = useState([])
  const [state, setState] = useState('loading')

  useEffect(() => {
    const ctrl = new AbortController()
    setState('loading')
    const facets = [[`project_type:${type}`]]
    if (version.trim()) facets.push([`versions:${version.trim()}`])
    const url = `https://api.modrinth.com/v2/search?query=${encodeURIComponent(q)}&limit=18&index=${q ? 'relevance' : 'downloads'}&facets=${encodeURIComponent(JSON.stringify(facets))}`
    const t = setTimeout(() => {
      fetch(url, { signal: ctrl.signal })
        .then((r) => {
          if (!r.ok) throw new Error('bad response')
          return r.json()
        })
        .then((d) => {
          setHits(d.hits || [])
          setState('ok')
        })
        .catch((e) => {
          if (e.name !== 'AbortError') setState('error')
        })
    }, 350)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [type, q, version])

  return (
    <div>
      <div className="row" style={{ marginBottom: 14 }}>
        <input style={{ flex: 1, minWidth: 200 }} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        <input style={{ width: 150 }} placeholder="Version e.g. 1.21.1" value={version} onChange={(e) => setVersion(e.target.value)} />
      </div>
      {state === 'loading' && <p className="mut">Loading…</p>}
      {state === 'error' && <p className="note">Couldn’t reach Modrinth right now. Try again in a moment, or browse modrinth.com directly.</p>}
      {state === 'ok' && hits.length === 0 && <p className="mut">No results.</p>}
      <div className="grid">
        {hits.map((h) => (
          <a key={h.project_id} className="card link" href={`https://modrinth.com/${h.project_type}/${h.slug}`} target="_blank" rel="noopener noreferrer">
            <div className="row" style={{ flexWrap: 'nowrap' }}>
              {h.icon_url ? <img className="thumb" src={h.icon_url} alt="" loading="lazy" /> : <div className="thumb" />}
              <div>
                <b>{h.title}</b>
                <div className="mut" style={{ fontSize: '0.8rem' }}>by {h.author} · ⬇ {fmt(h.downloads)}</div>
              </div>
            </div>
            <p className="mut" style={{ fontSize: '0.88rem' }}>{h.description}</p>
            <span className="badge">View on Modrinth ↗</span>
          </a>
        ))}
      </div>
      <p className="hint">Results come live from Modrinth. Downloads happen on their site.</p>
    </div>
  )
}

const LinkCards = ({ items }) => (
  <div className="grid">
    {items.map(([title, desc, url]) => (
      <a key={url} className="card link" href={url} target="_blank" rel="noopener noreferrer">
        <h3>{title}</h3>
        <p className="mut">{desc}</p>
        <span className="badge">Open ↗</span>
      </a>
    ))}
  </div>
)

export default function MinecraftHub() {
  const [tab, setTab] = useState('mod')

  return (
    <div>
      <div className="page-head">
        <h1>⛏️ Minecraft Hub</h1>
        <p className="mut">Java Edition resources. Launchers can’t run inside a browser, so this hub links out to them.</p>
      </div>

      <div className="tabs">
        {TABS.map(([id, label]) => (
          <button key={id} className={'tab' + (tab === id ? ' on' : '')} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {LIVE.includes(tab) && <ModrinthSearch key={tab} type={tab} />}

      {tab === 'skins' && (
        <LinkCards
          items={[
            ['Minecraft Skins', 'Huge library of community skins with an in-browser editor.', 'https://www.minecraftskins.com/'],
            ['NameMC', 'Browse popular skins, capes and player profiles.', 'https://namemc.com/minecraft-skins'],
            ['Change your skin (official)', 'Upload a skin to your Minecraft profile.', 'https://www.minecraft.net/en-us/msaprofile/mygames/editskin'],
          ]}
        />
      )}

      {tab === 'servers' && (
        <div>
          <LinkCards
            items={[
              ['Minecraft Server List', 'Browse servers by game mode and version.', 'https://minecraft-server-list.com/'],
              ['Planet Minecraft Servers', 'Community-rated server directory.', 'https://www.planetminecraft.com/servers/'],
              
            ]}
          />
          <p className="note" style={{ marginTop: 14 }}>Always check a server’s rules and age guidance before joining. Never share your password with anyone.</p>
        </div>
      )}

      {tab === 'learn' && (
        <LinkCards
          items={[
            ['Minecraft Wiki', 'The community encyclopedia for blocks, mobs, crafting and redstone.', 'https://minecraft.wiki/'],
            ['Official Minecraft Help', 'Setup, accounts and troubleshooting from Mojang.', 'https://help.minecraft.net/'],
            ['Fabric: installing mods', 'How to set up the Fabric mod loader.', 'https://fabricmc.net/use/installer/'],
            ['NeoForge', 'Mod loader for newer versions of modded Minecraft.', 'https://neoforged.net/'],
            ['Modrinth help', 'Guides on installing mods and modpacks.', 'https://support.modrinth.com/'],
          ]}
        />
      )}

      {tab === 'launchers' && (
        <div>
          <div className="grid" style={{ marginBottom: 16 }}>
            <div className="card">
              <h3>Official Minecraft Launcher</h3>
              <span className="badge">Recommended</span>
              <p className="mut">The supported way to play Java Edition. Requires a Minecraft purchase and Microsoft account.</p>
              <a className="btn gold" href="https://www.minecraft.net/en-us/download" target="_blank" rel="noopener noreferrer">Official download ↗</a>
            </div>
            <div className="card">
              <h3>Modrinth App</h3>
              <p className="mut">A free launcher focused on mods and modpacks. It works with your own Minecraft account.</p>
              <a className="btn" href="https://modrinth.com/app" target="_blank" rel="noopener noreferrer">Learn more ↗</a>
            </div>
            <div className="card">
              <h3>Prism Launcher</h3>
              <p className="mut">Open-source launcher for managing many instances with different mod loaders.</p>
              <a className="btn" href="https://prismlauncher.org/" target="_blank" rel="noopener noreferrer">Learn more ↗</a>
            </div>
            <div className="card">
              <h3>TLauncher</h3>
              <span className="badge">Info only</span>
              <p className="mut">TLauncher is an unofficial third-party launcher. It is not made or supported by Mojang or Microsoft, and it is widely used to play without buying the game. This hub does not link to its downloads. If you use any third-party launcher, only get it from its own official site and scan downloads with antivirus.</p>
            </div>
          </div>

          <h2>Version & compatibility notes</h2>
          <div className="card">
            <ul style={{ lineHeight: 1.7, margin: 0 }}>
              <li><b>Match versions.</b> A mod built for one Minecraft version usually won’t load on another. Use the version box in the Mods tab to filter.</li>
              <li><b>Match loaders.</b> Fabric, Quilt, Forge and NeoForge mods aren’t interchangeable. Check which loader the mod lists.</li>
              <li><b>Java.</b> Newer Minecraft versions need newer Java. The official launcher bundles the right one; other launchers may ask you to install it.</li>
              <li><b>Shaders</b> need a loader plus a shader mod (Iris on Fabric/Quilt, or OptiFine). Resource packs need no loader.</li>
              <li><b>Latest version:</b> check the <a href="https://minecraft.wiki/w/Java_Edition_version_history" target="_blank" rel="noopener noreferrer">version history on the Minecraft Wiki</a>, since it changes with every update.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
