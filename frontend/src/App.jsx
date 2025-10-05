import { useEffect } from 'react'
import './App.css'
import asteroidImage from './assets/asteroid.png'
import fireImage from './assets/fire.png'

function Star({ style }) {
  return <div className="star" style={style} />
}

function App() {
  // generate a fixed set of random star positions on mount
  const starCount = 60
  const stars = []
  for (let i = 0; i < starCount; i++) {
    const size = Math.random() * 2 + 1 // 1 - 3px
    const top = Math.random() * 100
    const left = Math.random() * 100
    const opacity = Math.random() * 0.6 + 0.2
    stars.push({ width: size, height: size, top: `${top}%`, left: `${left}%`, opacity })
  }

  return (
    <div className="app-root">
      <div className="starfield" aria-hidden>
        {stars.map((s, i) => (
          <Star key={i} style={{ width: `${s.width}px`, height: `${s.height}px`, top: s.top, left: s.left, opacity: s.opacity }} />
        ))}
      </div>

      <main className="center-area">
        <div className="asteroid-wrap">
          <img src={fireImage} alt="Fire" className="asteroid-fire" />
          <img src={asteroidImage} alt="Asteroid" className="asteroid" />
        </div>
        <button className="simulate-btn">SIMULATE</button>
      </main>
    </div>
  )
}

export default App