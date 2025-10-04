import './App.css'
import React, { useState } from 'react'
import MapComponent from './MapComponent'
import asteroidImage from './assets/asteroid.png'
import fireImage from  './assets/fire.png'

function App() {
  const [started, setStarted] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState(null)

  const handleSimulate = () => {
    setStarted(true)
  }

  return (
    <div className="scene">
      <header className="center">
        {!started && (
          <>
            <img
              src={fireImage}
              alt="Fireball image"
              className="fireball"
            />

            <img
              src={asteroidImage}
              alt="Irregular asteroid shape"
              className="asteroid"
            />

            <button className="simulate-btn" onClick={handleSimulate}>simulate</button>
          </>
        )}

        {started && (
          <>
            <div className="map-wrapper">
              <MapComponent onSelect={(latlng) => setSelectedPoint(latlng)} />
            </div>

            {/* continue button shown outside the map at bottom-right when a point is selected */}
            {selectedPoint && (
              <button className="continue-btn">continue</button>
            )}
          </>
        )}
      </header>
    </div>
  )
}

export default App
