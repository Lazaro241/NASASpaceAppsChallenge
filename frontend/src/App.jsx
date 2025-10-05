import { useEffect, useState } from 'react'
import './App.css'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import asteroidImage from './assets/asteroid.png'
import fireImage from './assets/fire.png'

function Star({ style }) {
  return <div className="star" style={style} />
}

function App() {
  const [simulating, setSimulating] = useState(false)
  const [markerPos, setMarkerPos] = useState(null)
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
        setMarkerPos([e.latlng.lat, e.latlng.lng])
      }
    })
    return null
  }

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

        {simulating && (
          <div className="map-area" role="region" aria-label="Simulation map">
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
          </div>
        )}
      </main>
    </div>
  )
}

export default App