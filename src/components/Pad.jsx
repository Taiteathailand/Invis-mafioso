export default function Pad({ onDir }) {
  return (
    <div className="pad">
      <button onPointerDown={() => onDir('up')}>▲</button>
      <div>
        <button onPointerDown={() => onDir('left')}>◀</button>
        <button onPointerDown={() => onDir('down')}>▼</button>
        <button onPointerDown={() => onDir('right')}>▶</button>
      </div>
    </div>
  )
}
