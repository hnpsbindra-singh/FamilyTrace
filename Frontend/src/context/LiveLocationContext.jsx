import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { locationAPI } from '../services/api'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import { useGeolocation } from '../hooks/useGeolocation'
import { useWebSocket } from '../hooks/useWebSocket'

const LiveLocationContext = createContext(null)
const STORAGE_KEY = 'ft_live_location_family_id'
const SHARE_INTERVAL_MS = 5000

function readStoredFamilyId() {
  return localStorage.getItem(STORAGE_KEY)
}

export function LiveLocationProvider({ children }) {
  const { isAuth } = useAuth()
  const toast = useToast()
  const [activeFamilyId, setActiveFamilyId] = useState(() => readStoredFamilyId())
  const [lastSharedAt, setLastSharedAt] = useState(null)
  const [lastSharedLocation, setLastSharedLocation] = useState(null)
  const [shareError, setShareError] = useState(null)
  const sharing = !!activeFamilyId && isAuth
  const sharingRef = useRef(sharing)
  const socketWarnedRef = useRef(false)
  const apiErrorWarnedRef = useRef(false)
  const { coords, error: geoError } = useGeolocation(sharing)
  const { sendLocation, connected, error: socketError } = useWebSocket(activeFamilyId, null)

  useEffect(() => {
    sharingRef.current = sharing
  }, [sharing])

  useEffect(() => {
    if (!isAuth) {
      setActiveFamilyId(null)
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [isAuth])

  const startSharing = useCallback((familyId) => {
    const nextFamilyId = String(familyId)
    localStorage.setItem(STORAGE_KEY, nextFamilyId)
    socketWarnedRef.current = false
    apiErrorWarnedRef.current = false
    setShareError(null)
    setActiveFamilyId(nextFamilyId)
  }, [])

  const stopSharing = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setActiveFamilyId(null)
    setShareError(null)
  }, [])

  const shareLocation = useCallback((latitude, longitude) => {
    const sentOverSocket = sendLocation(latitude, longitude)
    if (!sentOverSocket && !socketWarnedRef.current) {
      socketWarnedRef.current = true
      toast('Live socket is still connecting. Location will be saved through the API.', 'error')
    }

    return locationAPI.update({ latitude, longitude })
      .then(() => {
        setLastSharedAt(new Date().toISOString())
        setLastSharedLocation({ lat: latitude, lng: longitude })
        setShareError(null)
        apiErrorWarnedRef.current = false
      })
      .catch(() => {
        setShareError('Failed to share your location')
        if (!apiErrorWarnedRef.current) {
          apiErrorWarnedRef.current = true
          toast('Failed to share your location', 'error')
        }
      })
  }, [sendLocation, toast])

  useEffect(() => {
    if (!sharing || !coords) return

    shareLocation(coords.lat, coords.lng)
    const interval = setInterval(() => {
      if (sharingRef.current && coords) {
        shareLocation(coords.lat, coords.lng)
      }
    }, SHARE_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [sharing, coords?.lat, coords?.lng, shareLocation])

  const value = useMemo(() => ({
    activeFamilyId,
    sharing,
    coords,
    geoError,
    connected,
    socketError,
    shareError,
    lastSharedAt,
    lastSharedLocation,
    startSharing,
    stopSharing,
  }), [
    activeFamilyId,
    sharing,
    coords,
    geoError,
    connected,
    socketError,
    shareError,
    lastSharedAt,
    lastSharedLocation,
    startSharing,
    stopSharing,
  ])

  return (
    <LiveLocationContext.Provider value={value}>
      {children}
    </LiveLocationContext.Provider>
  )
}

export function useLiveLocation() {
  return useContext(LiveLocationContext)
}
