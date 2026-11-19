import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useLocalStorage } from '../hooks'

const ago = (iso) => {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return s + 's ago'
  if (s < 3600) return Math.floor(s / 60) + 'm ago'
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  return Math.floor(s / 86400) + 'd ago'
}

function Composer({ onPost, disabled }) {
  const [text, setText] = useState('')
  const submit = (e) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    onPost(t)
    setText('')
  }
  return (
    <form onSubmit={submit} className="row" style={{ marginBottom: 14 }}>
      <input style={{ flex: 1, minWidth: 220 }} maxLength={280} placeholder="What's happening?" value={text} onChange={(e) => setText(e.target.value)} />
      <button className="btn gold" disabled={disabled}>Post</button>
    </form>
  )
}

// Local-only mode: works with no setup, posts stay on this device.
function LocalFeed() {
  const [name, setName] = useLocalStorage('social-name', 'Guest')
  const [posts, setPosts] = useLocalStorage('social-posts', [
    { id: 1, author: 'INVIS MAFIOSO', body: 'Welcome to the feed. Connect Supabase to share posts with other people.', created_at: new Date().toISOString() },
  ])

  const post = (body) => setPosts((p) => [{ id: Date.now(), author: name || 'Guest', body, created_at: new Date().toISOString() }, ...p])

  return (
    <div>
      <div className="note" style={{ marginBottom: 14 }}>
        <b>Local mode.</b> Accounts and shared posts need a Supabase project (free). Until you add one, posts are saved only in this browser. See the README.
      </div>
      <div className="row" style={{ marginBottom: 10 }}>
        <span className="mut">Posting as</span>
        <input value={name} maxLength={24} onChange={(e) => setName(e.target.value)} />
      </div>
      <Composer onPost={post} />
      <div className="card">
        {posts.map((p) => (
          <div key={p.id} className="post">
            <span className="who">{p.author}</span> <span className="mut">· {ago(p.created_at)}</span>
            <div>{p.body}</div>
            <button className="btn sm" style={{ marginTop: 6 }} onClick={() => setPosts((all) => all.filter((x) => x.id !== p.id))}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// Cloud mode: real accounts and a shared feed via Supabase.
function CloudFeed() {
  const [session, setSession] = useState(null)
  const [posts, setPosts] = useState([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [msg, setMsg] = useState('')

  const load = async () => {
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(50)
    if (error) setMsg('Could not load posts: ' + error.message)
    else setPosts(data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    load()
    return () => sub.subscription.unsubscribe()
  }, [])

  const signUp = async () => {
    setMsg('')
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { username: username || email.split('@')[0] } } })
    setMsg(error ? error.message : 'Account created. Check your email if confirmation is required, then sign in.')
  }
  const signIn = async () => {
    setMsg('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMsg(error.message)
  }
  const post = async (body) => {
    const author = session.user.user_metadata?.username || session.user.email.split('@')[0]
    const { error } = await supabase.from('posts').insert({ author, body })
    if (error) setMsg(error.message)
    else load()
  }
  const del = async (id) => {
    await supabase.from('posts').delete().eq('id', id)
    load()
  }

  return (
    <div>
      {!session ? (
        <div className="card" style={{ marginBottom: 14, maxWidth: 420 }}>
          <h2>Sign in or create an account</h2>
          <div className="row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <input placeholder="Username (for new accounts)" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password (6+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="row">
              <button className="btn gold" onClick={signIn}>Sign in</button>
              <button className="btn" onClick={signUp}>Create account</button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <span className="mut">Signed in as {session.user.user_metadata?.username || session.user.email}</span>
            <button className="btn sm" onClick={() => supabase.auth.signOut()}>Sign out</button>
          </div>
          <Composer onPost={post} />
        </div>
      )}
      {msg && <p className="note">{msg}</p>}
      <div className="row" style={{ marginBottom: 8 }}>
        <button className="btn sm" onClick={load}>↻ Refresh</button>
      </div>
      <div className="card">
        {posts.length === 0 && <p className="mut">No posts yet.</p>}
        {posts.map((p) => (
          <div key={p.id} className="post">
            <span className="who">{p.author}</span> <span className="mut">· {ago(p.created_at)}</span>
            <div>{p.body}</div>
            {session && session.user.id === p.user_id && (
              <button className="btn sm" style={{ marginTop: 6 }} onClick={() => del(p.id)}>Delete</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Social() {
  return (
    <div>
      <div className="page-head">
        <h1>💬 Social</h1>
        <p className="mut">The INVIS MAFIOSO feed. Keep it friendly, and never share personal info or passwords.</p>
      </div>
      {supabase ? <CloudFeed /> : <LocalFeed />}
    </div>
  )
}
