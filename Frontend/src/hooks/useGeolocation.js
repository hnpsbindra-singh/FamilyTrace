import { useState, useEffect } from 'react'

export function useGeolocation(enabled = true) {
  const [coords, setCoords] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) return

    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 10000 }
    )

    return () => navigator.geolocation.clearWatch(id)
  }, [enabled])

  return { coords, error }
}
