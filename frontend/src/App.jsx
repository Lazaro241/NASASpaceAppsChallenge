import './App.css'
import React, { useState, useEffect } from 'react'
import MapComponent from './MapComponent'
import asteroidImage from './assets/asteroid.png'
import fireImage from './assets/fire.png'

function App() {
  const [started, setStarted] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [showList, setShowList] = useState(false)
  const [asteroids, setAsteroids] = useState([])
  const [selectedAsteroid, setSelectedAsteroid] = useState(null)
  const [showImpact, setShowImpact] = useState(false)

  // Store selectedPoint in localStorage for persistence
  useEffect(() => {
    if (selectedPoint) {
      localStorage.setItem('selectedPoint', JSON.stringify(selectedPoint))
      console.log('Selected Point Stored:', selectedPoint) // For debugging
    }
  }, [selectedPoint])

  // Handle asteroid selection
  const handleAsteroidSelect = (asteroid) => {
    // asteroid here is the item from the merged list (has details)
    setSelectedAsteroid(asteroid)
    console.log('Selected Asteroid:', asteroid) // For debugging
  }

  const handleSimulate = () => {
    setStarted(true)
  }

  const handleContinue = () => {
    console.log('Continue with:', { selectedPoint, selectedAsteroid }) // For debugging
    setShowList(false)
    setSelectedAsteroid(null)
    setShowImpact(true)
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

        {started && !showList && !showImpact && (
          <>
            <div className="map-wrapper">
              <MapComponent
                onSelect={(latlng) => setSelectedPoint(latlng)}
                selectedPoint={selectedPoint}
              />
            </div>

            {/* continue button shown outside the map at bottom-right when a point is selected */}
            {selectedPoint && (
              <button className="continue-btn" onClick={async () => {
                try {
                  // Load both list and details, then merge by id
                  const [listRes, detailsRes] = await Promise.all([
                    fetch('/asteroids_list.json'),
                    fetch('/asteroids_details.json')
                  ])
                  const listData = await listRes.json()
                  const detailsData = await detailsRes.json()

                  // Build a map of details by id for fast lookup
                  const detailsMap = new Map(detailsData.map(d => [d.id, d]))

                  // Merge: prefer detail fields when present
                  const merged = listData.map(item => ({
                    ...item,
                    ...detailsMap.get(item.id)
                  }))

                  setAsteroids(merged)
                  setShowList(true)
                } catch (err) {
                  console.error('Failed to load asteroids list or details', err)
                }
              }}>continue</button>
            )}
          </>
        )}

        {showImpact && (
          <>
            <h2 className="impact-message">The asteroid has impacted on that point!</h2>
            <div className="map-wrapper">
              <MapComponent
                selectedPoint={selectedPoint}
                disableClicks={true}
              />
            </div>
          </>
        )}
      </header>
      {showList && (
        <div className="content-wrapper">
          <main className="asteroids-list">
            <h2>Asteroids summary</h2>
            <button onClick={() => {
              setShowList(false)
              setSelectedAsteroid(null) // Clear selected asteroid when going back
            }}>Back</button>
            <ul>
              {asteroids.map((a) => (
                <li
                  key={a.id}
                  className={selectedAsteroid?.id === a.id ? 'selected' : ''}
                  onClick={() => handleAsteroidSelect(a)}
                >
                  {a.id} — {a.name}
                </li>
              ))}
            </ul>
          </main>
          {selectedAsteroid && (
            <aside className="asteroid-details">
              <h3>{selectedAsteroid.name} Details</h3>
              <ul>
                <li><strong>Date:</strong> {selectedAsteroid.date || 'N/A'}</li>
                <li><strong>Diameter:</strong> {(selectedAsteroid.diameter_km ?? selectedAsteroid.diameter) || 'N/A'} km</li>
                <li><strong>Velocity:</strong> {(selectedAsteroid.velocity_kms ?? selectedAsteroid.velocity) || 'N/A'} km/s</li>
                <li><strong>ID:</strong> {selectedAsteroid.id}</li>
              </ul>
              <button className="continue-btn" onClick={handleContinue}>continue</button>
            </aside>
          )}
        </div>
      )}
    </div>
  )
}

export default App