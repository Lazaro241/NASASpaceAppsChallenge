import { useEffect, useState } from 'react'
import './App.css'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import asteroidImage from './assets/asteroid.png'
import fireImage from './assets/fire.png'
// details are provided by the backend API; no local fallback

function Star({ style }) {
  return <div className="star" style={style} />
}

function App() {
  const [simulating, setSimulating] = useState(false)
  const [markerPos, setMarkerPos] = useState(null)
  const [selectedLat, setSelectedLat] = useState(null)
  const [selectedLng, setSelectedLng] = useState(null)
  const [showAsteroidList, setShowAsteroidList] = useState(false)
  const [selectedAsteroidId, setSelectedAsteroidId] = useState(null)
  const [asteroids, setAsteroids] = useState([])
  const [loadingAsteroids, setLoadingAsteroids] = useState(false)
  const [error, setError] = useState(null)
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

  const handleSimulate = () => {
    setSimulating(true)
  }

  // ensure the default marker icon is loaded correctly (fix for some bundlers)
  useEffect(() => {
    // Use CDN-hosted marker icons to avoid bundler asset issues
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    })
  }, [])

  function ClickHandler() {
    useMapEvents({
      click(e) {
        const lat = e.latlng.lat
        const lng = e.latlng.lng
        setMarkerPos([lat, lng])
        setSelectedLat(lat)
        setSelectedLng(lng)
        // persist to localStorage
        try {
          localStorage.setItem('selectedLat', String(lat))
          localStorage.setItem('selectedLng', String(lng))
        } catch (err) {
          // ignore storage errors (e.g., privacy mode)
        }
        // expose globally for quick access in console/tests
        try {
          window.selectedLat = lat
          window.selectedLng = lng
        } catch (err) {
          // ignore
        }
      }
    })
    return null
  }

  useEffect(() => {
  if (showAsteroidList) {
    setLoadingAsteroids(true)
    setError(null)
    fetch('http://127.0.0.1:5000/api/asteroids-summary')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.json()
      })
      .then((data) => setAsteroids(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingAsteroids(false))
  }
}, [showAsteroidList])

  return (
    <div className="app-root">
      <div className="starfield" aria-hidden>
        {stars.map((s, i) => (
          <Star key={i} style={{ width: `${s.width}px`, height: `${s.height}px`, top: s.top, left: s.left, opacity: s.opacity }} />
        ))}
      </div>

      <main className="center-area">
        {!simulating && (
          <>
            <div className="asteroid-wrap">
              <img src={fireImage} alt="Fire" className="asteroid-fire" />
              <img src={asteroidImage} alt="Asteroid" className="asteroid" />
            </div>
            <button className="simulate-btn" onClick={handleSimulate}>SIMULATE</button>
          </>
        )}

        {simulating && !showAsteroidList && (
          <div className="map-area" role="region" aria-label="Simulation map">
            <div className="map-header">📍CHOOSE A PLACE</div>
            <MapContainer center={[0, 0]} zoom={2} scrollWheelZoom={false} className="leaflet-map">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ClickHandler />
              {markerPos && (
                <Marker position={markerPos} />
              )}
            </MapContainer>
            {selectedLat !== null && selectedLng !== null && (
              <button className="next-btn" onClick={() => setShowAsteroidList(true)}>NEXT</button>
            )}
          </div>
        )}

        {showAsteroidList && (
          <div className="asteroid-list-area" role="region" aria-label="Asteroid chooser">
            <div className="map-header">CHOOSE AN ASTEROID</div>
            <button className="back-btn" onClick={() => setShowAsteroidList(false)}>BACK</button>

            {loadingAsteroids && <p>Loading asteroids...</p>}
            {error && <p className="error">Error: {error}</p>}

            {!loadingAsteroids && !error && (
              <ul className="asteroid-list">
                {asteroids.map((a) => (
                  <li key={a.id} className={selectedAsteroidId === a.id ? 'selected' : ''}>
                    <label>
                      <input
                        type="radio"
                        name="asteroid"
                        value={a.id}
                        checked={selectedAsteroidId === a.id}
                        onChange={() => setSelectedAsteroidId(a.id)}
                      />
                      <span className="asteroid-item">{a.name} — {a.id}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {/* Sidebar: show when an asteroid is selected */}
        {selectedAsteroidId && (
          <aside className={`asteroid-sidebar ${selectedAsteroidId ? 'open' : ''}`} aria-live="polite">
            <button className="sidebar-close" onClick={() => setSelectedAsteroidId(null)}>×</button>
            {(() => {
              // Use the fetched asteroids data from the API only
              const details = asteroids.find(a => a.id === selectedAsteroidId) || null
              const name = details ? details.name : selectedAsteroidId
              return (
                <div className="sidebar-content">
                  <h3>{name}</h3>
                  {details ? (
                    <>
                      <p><strong>Name:</strong> {name}</p>
                      <p><strong>Date:</strong> {details.date}</p>
                      <p><strong>Diameter(km):</strong> {details.diameter_km}</p>
                      <p><strong>Velocity(km/s):</strong> {details.velocity_kms}</p>
                    </>
                  ) : (
                    <p>Details not available. Ensure the backend `/api/asteroids-summary` returned the asteroid data.</p>
                  )}
                </div>
              )
            })()}
          </aside>
        )}
      </main>
    </div>
  )
}

export default App