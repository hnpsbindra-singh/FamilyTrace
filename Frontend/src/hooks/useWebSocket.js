import { useEffect, useRef, useCallback, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs.min.js'

const wsUrl = import.meta.env.VITE_WS_URL || '/ws'

export function useWebSocket(familyIds, onLocationUpdate) {
  const clientRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const token = localStorage.getItem('ft_token')
  const callbackRef = useRef(onLocationUpdate)
  useEffect(() => { callbackRef.current = onLocationUpdate }, [onLocationUpdate])

  const sendLocation = useCallback((latitude, longitude) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: '/app/location',
        body: JSON.stringify({ latitude, longitude }),
      })
      return true
    }
    return false
  }, [])

  useEffect(() => {
    if (!token) return
    const ids = Array.isArray(familyIds) ? familyIds : familyIds ? [familyIds] : []
    if (ids.length === 0) return

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        setConnected(true)
        setError(null)
        ids.forEach(id => {
          client.subscribe(`/topic/family/${id}`, (msg) => {
            try {
              const data = JSON.parse(msg.body)
              callbackRef.current?.(data, id)
            } catch {}
          })
        })
      },
      onStompError: (frame) => {
        setError(frame.headers?.message || 'Live connection failed')
        setConnected(false)
        console.error('STOMP error', frame)
      },
      onWebSocketClose: () => setConnected(false),
      onWebSocketError: () => {
        setError('Live connection failed')
        setConnected(false)
      },
      reconnectDelay: 4000,
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
      clientRef.current = null
      setConnected(false)
    }
  }, [JSON.stringify(Array.isArray(familyIds) ? familyIds : [familyIds]), token])

  return { sendLocation, client: clientRef, connected, error }
}
