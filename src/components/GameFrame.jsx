export default function GameFrame({ title, score, best, hint, onRestart, scoreLabel = 'Score', bestLabel = 'Best', children }) {
  return (
    <div className="gf">
      <div className="gf-bar">
        <h3>{title}</h3>
        <div className="gf-stats">
          <span>
            {scoreLabel}: <b>{score}</b>
          </span>
          <span>
            {bestLabel}: <b>{best ?? '—'}</b>
          </span>
          <button className="btn sm" onClick={onRestart}>
            Restart
          </button>
        </div>
      </div>
      <div className="gf-body">{children}</div>
      {hint && <p className="hint">{hint}</p>}
    </div>
  )
}
