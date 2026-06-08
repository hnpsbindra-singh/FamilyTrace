import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { locationAPI, familyAPI } from '../services/api'
import { useWebSocket } from '../hooks/useWebSocket'
import { useLiveLocation } from '../context/LiveLocationContext'
import { useToast } from '../context/ToastContext'
import './MapPage.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function makeIcon(letter, color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:36px;height:36px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 3px 12px rgba(0,0,0,0.4);border:2px solid white;
    ">
      <span style="transform:rotate(45deg);font-size:13px;font-weight:700;color:#0d0f14;">${letter}</span>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  })
}

const COLORS = ['#e8c87a', '#5fcf9e', '#7aaef0', '#f0a04b', '#c87af0', '#f07a9e']
let colorCounter = 0
const colorMap = {}
function getColor(name) {
  if (!colorMap[name]) {
    colorMap[name] = COLORS[colorCounter % COLORS.length]
    colorCounter++
  }
  return colorMap[name]
}

function FitBounds({ positions }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions.map(p => [p.latitude, p.longitude]))
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    }
  }, [map, positions])
  return null
}

function normalizeLocations(items = []) {
  return items.filter(loc =>
    loc &&
    Number.isFinite(Number(loc.latitude)) &&
    Number.isFinite(Number(loc.longitude))
  ).map(loc => ({
    ...loc,
    latitude: Number(loc.latitude),
    longitude: Number(loc.longitude),
  }))
}

export default function MapPage() {
  const { id } = useParams()
  const toast = useToast()
  const [locations, setLocations] = useState([])
  const [family, setFamily] = useState(null)
  const [loadingLocations, setLoadingLocations] = useState(true)
  const {
    activeFamilyId,
    sharing,
    coords,
    geoError,
    connected: sharingConnected,
    socketError: sharingSocketError,
    shareError,
    startSharing,
    stopSharing,
  } = useLiveLocation()
  const isSharingThisFamily = sharing && activeFamilyId === id

  // Stable callback: merge incoming WS location update into state
  const handleLocationUpdate = useCallback((update) => {
    setLocations(prev => {
      const cleanUpdate = normalizeLocations([update])[0]
      if (!cleanUpdate) return prev
      const idx = prev.findIndex(l => l.userName === cleanUpdate.userName)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = cleanUpdate
        return next
      }
      return [...prev, cleanUpdate]
    })
  }, [])

  const { connected, error: socketError } = useWebSocket(id, handleLocationUpdate)

  const refreshLocations = useCallback(() => {
    return locationAPI.getAll(id)
      .then(r => setLocations(normalizeLocations(r.data)))
      .catch(() => toast('Failed to refresh family locations', 'error'))
      .finally(() => setLoadingLocations(false))
  }, [id, toast])

  useEffect(() => {
    familyAPI.details(id).then(r => setFamily(r.data)).catch(() => {})
    setLoadingLocations(true)
    refreshLocations()
    const interval = setInterval(refreshLocations, 5000)
    return () => clearInterval(interval)
  }, [id, refreshLocations])

  const center = locations.length > 0
    ? [locations[0].latitude, locations[0].longitude]
    : [20.5937, 78.9629]

  const formatTime = (t) => {
    if (!t) return ''
    return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="map-page fade-up">
      <div className="map-header">
        <div>
          <h1 className="map-title">Live Map</h1>
          <p className="map-sub">
            {family?.familyName ?? 'Family'} &middot; {locations.length} member{locations.length !== 1 ? 's' : ''} located
          </p>
        </div>
        <button
          className={`btn share-btn ${isSharingThisFamily ? 'btn-danger' : 'btn-primary'}`}
          onClick={() => isSharingThisFamily ? stopSharing() : startSharing(id)}>
          {isSharingThisFamily ? 'Stop Sharing' : sharing ? 'Share Here' : 'Share My Location'}
        </button>
      </div>

      {isSharingThisFamily && (
        <div className="sharing-banner fade-in">
          <span className="sharing-dot" />
          {shareError
            ? shareError
            : geoError
            ? geoError
            : coords
              ? `${sharingConnected ? 'Sharing live' : 'Connecting'} - ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
              : 'Waiting for GPS signal...'}
        </div>
      )}

      {sharing && !isSharingThisFamily && (
        <div className="map-notice">
          You are already sharing live location with another family. Use Share Here to switch.
        </div>
      )}

      {(socketError || sharingSocketError) && (
        <div className="map-notice">
          Live connection is unavailable. Showing saved locations and refreshing every 5 seconds.
        </div>
      )}

      <div className="map-layout">
        <div className="map-container-wrap">
          <MapContainer center={center} zoom={10} className="leaflet-map">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {locations.length > 0 && <FitBounds positions={locations} />}
            {locations.map((loc) => (
              <Marker
                key={loc.userName}
                position={[loc.latitude, loc.longitude]}
                icon={makeIcon(loc.userName[0].toUpperCase(), getColor(loc.userName))}>
                <Popup>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', minWidth: 120 }}>
                    <strong>{loc.userName}</strong><br />
                    {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}<br />
                    <small style={{ color: '#666' }}>Updated {formatTime(loc.lastUpdated)}</small>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="map-sidebar">
          <h3 className="map-sidebar-title">Members</h3>
          {loadingLocations ? (
            <p className="map-empty">Loading family locations...</p>
          ) : locations.length === 0 ? (
            <p className="map-empty">No saved locations yet.<br/>Ask members to share their location.</p>
          ) : (
            <div className="location-list">
              {locations.map((loc) => (
                <div key={loc.userName} className="location-item">
                  <div className="location-dot" style={{ background: getColor(loc.userName) }} />
                  <div className="location-info">
                    <div className="location-name">{loc.userName}</div>
                    <div className="location-coords">
                      {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                    </div>
                    <div className="location-time">Updated {formatTime(loc.lastUpdated)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
