import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ClickHandler = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      if (onSelect) onSelect([lat, lng])
    }
  })
  return null
}

const MapComponent = ({ onSelect, initialPosition = [28.5721, -80.6480] }) => {
  // Track the user's selected point (single marker). Parent can also track via onSelect.
  const [selected, setSelected] = useState(null)

  const handleSelect = useCallback((latlng) => {
    setSelected(latlng)
    if (onSelect) onSelect(latlng)
  }, [onSelect])

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer 
        center={initialPosition} 
        zoom={10} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ClickHandler receives map clicks and reports them */}
        <ClickHandler onSelect={handleSelect} />

        {/* Single marker: update position each click */}
        {selected && (
          <Marker position={selected}>
            <Popup>
              Selected point: {selected[0].toFixed(4)}, {selected[1].toFixed(4)}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;