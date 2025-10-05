import { useEffect, useState } from 'react'
import './App.css'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, useMapEvents, Circle } from 'react-leaflet'
import L from 'leaflet'
import asteroidImage from './assets/asteroid.png'
import fireImage from './assets/fire.png'

const COMPOSITION_COLOR = { C: '#ff4500', S: '#ffa500', M: '#ff69b4' }
const COMPOSITION_CRATER_COLOR = { C: '#3d3b6cff', S: '#3c7a37ff', M: '#762249ff' }

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
  const [showFinalMap, setShowFinalMap] = useState(false)
  const [impactResult, setImpactResult] = useState(null)
  const [impactLoading, setImpactLoading] = useState(false)
  const [impactError, setImpactError] = useState(null)
  const [loadingAsteroids, setLoadingAsteroids] = useState(false)
  const [error, setError] = useState(null)

  const starCount = 60
  const stars = []
  for (let i = 0; i < starCount; i++) {
    const size = Math.random() * 2 + 1
    const top = Math.random() * 100
    const left = Math.random() * 100
    const opacity = Math.random() * 0.6 + 0.2
    stars.push({ width: size, height: size, top: `${top}%`, left: `${left}%`, opacity })
  }

  const handleSimulate = () => {
    setSimulating(true)
  }

  const handleBackToStart = () => {
    setSimulating(false)
    setMarkerPos(null)
    setSelectedLat(null)
    setSelectedLng(null)
    setShowAsteroidList(false)
    setSelectedAsteroidId(null)
    setShowFinalMap(false)
    setImpactResult(null)
    setImpactLoading(false)
    setImpactError(null)
  }

  const compositionMap = {
    C: "Carbonaceous",
    S: "Stony",
    M: "Metallic"
  }

  useEffect(() => {
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
        try {
          localStorage.setItem('selectedLat', String(lat))
          localStorage.setItem('selectedLng', String(lng))
        } catch (err) {
          // ignore
        }
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
            <p className="app-title">ASTEROID IMPACT SIMULATOR</p>
            <p className="app-subtitle">Discover the potential impact of asteroids on Earth</p>  
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

        {selectedAsteroidId && (
          <aside className={`asteroid-sidebar ${selectedAsteroidId ? 'open' : ''}`} aria-live="polite">
            <button className="sidebar-close" onClick={() => setSelectedAsteroidId(null)}>×</button>
            {(() => {
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

        {selectedAsteroidId && !showFinalMap && (
          <button
            className="continue-btn"
            onClick={async () => {
              console.log('CONTINUE clicked with asteroid:', selectedAsteroidId)
              const details = asteroids.find(a => a.id === selectedAsteroidId) || {}
              const payload = {
                diameter_km: details.diameter_km || 1,
                velocity_kms: details.velocity_kms || 20,
                angle: 45
              }
              setImpactLoading(true)
              setImpactError(null)
              try {
                const res = await fetch('http://127.0.0.1:5000/api/impact', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                })
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const data = await res.json()
                setImpactResult(data)
                setShowFinalMap(true)
              } catch (err) {
                console.error('Impact API error', err)
                setImpactError(err.message || String(err))
              } finally {
                setImpactLoading(false)
              }
            }}
          >
            CONTINUE
          </button>
        )}

        {showFinalMap && markerPos && (
          <div className="final-map-wrap">
            <div className="impact-legend" aria-hidden>
              <h5>Composition legend</h5>
              <div className="legend-section">
                <div className="legend-section-title">Shockwave</div>
                <ul>
                  {Object.keys(COMPOSITION_COLOR).map((k) => (
                    <li key={`s-${k}`}><span className="swatch" style={{ background: COMPOSITION_COLOR[k] }} /> {compositionMap[k] || k}</li>
                  ))}
                </ul>
              </div>
              <div className="legend-section">
                <div className="legend-section-title">Crater</div>
                <ul>
                  {Object.keys(COMPOSITION_CRATER_COLOR).map((k) => (
                    <li key={`c-${k}`}><span className="swatch crater-swatch" style={{ background: COMPOSITION_CRATER_COLOR[k] }} /> {compositionMap[k] || k}</li>
                  ))}
                </ul>
              </div>
              <div className="legend-note">Shockwave = filled circle; Crater = dashed outline (km)</div>
            </div>
            <MapContainer center={markerPos} zoom={6} scrollWheelZoom={false} className="final-map">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={markerPos} />
              {impactResult && Object.keys(impactResult).map((key) => {
                const r = impactResult[key]
                if (!r) return null
                const elements = []
                if (r.shockwave_radius_km) {
                  const radiusMeters = Number(r.shockwave_radius_km) * 1000
                  const fillColor = COMPOSITION_COLOR[key] || '#3388ff'
                  elements.push(
                    <Circle
                      key={`shock-${key}`}
                      center={markerPos}
                      radius={radiusMeters}
                      pathOptions={{ color: fillColor, fillColor: fillColor, fillOpacity: 0.15 }}
                    />
                  )
                }
                if (r.crater_radius_km) {
                  const craterMeters = Number(r.crater_radius_km) * 1000
                  const strokeColor = COMPOSITION_CRATER_COLOR[key] || '#7fb3ff'
                  elements.push(
                    <Circle
                      key={`crater-${key}`}
                      center={markerPos}
                      radius={craterMeters}
                      pathOptions={{ color: strokeColor, weight: 2, fillOpacity: 0, dashArray: '6 6' }}
                    />
                  )
                }
                return elements
              })}
            </MapContainer>
            <div className="impact-panel" aria-live="polite">
              {impactLoading && <div className="impact-loading">Calculating impact...</div>}
              {impactError && <div className="impact-error">Error: {impactError}</div>}
              {impactResult && (
                <div className="impact-results">
                  <h4>Impact results</h4>
                  {Object.keys(impactResult).map((key) => {
                    const r = impactResult[key]
                    if (!r) return null
                    return (
                      <div key={key} className="impact-entry">
                        <div className="impact-entry-header">Composition: {compositionMap[key] || key}</div>
                        <p><strong>Shockwave radius:</strong> {r.shockwave_radius_km} km</p>
                        <p><strong>Crater Radius:</strong> {r.crater_radius_km} km</p>
                        <p><strong>Impact Energy:</strong> {r.energy_megatons ? r.energy_megatons.toFixed(2) : 0} MT</p>
                        <p><strong>Comparison summary:</strong> {r.comparison ? r.comparison.summary : ''}</p>
                      </div>
                    )
                  })}
                  <div className="impact-meta">(Results shown for all compositions)</div>
                </div>
              )}
            </div>
            <button className="start-over-btn" onClick={handleBackToStart}>START OVER</button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App