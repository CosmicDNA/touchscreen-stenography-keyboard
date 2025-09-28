import { useRef, useEffect, useCallback } from 'react'

/**
 * A React hook to request and manage a screen wake lock.
 * This prevents the device's screen from turning off.
 */
const useWakeLock = () => {
  const wakeLockRef = useRef(null)

  const requestWakeLock = useCallback(async () => {
    // Check if the Screen Wake Lock API is supported by the browser
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
        console.log('Screen Wake Lock is active.')

        // Listen for the release event, which can happen for various reasons.
        wakeLockRef.current.addEventListener('release', () => {
          console.log('Screen Wake Lock was released.')
          // The lock has been released, so we set our ref to null.
          wakeLockRef.current = null
        })
      } catch (err) {
        // This can happen if the user denies the request or for other reasons.
        console.error(`Could not acquire wake lock: ${err.name}, ${err.message}`)
        wakeLockRef.current = null
      }
    } else {
      console.warn('Screen Wake Lock API is not supported in this browser.')
    }
  }, [])

  useEffect(
    () => {
      // The lock is released when the page is not visible.
      // We need to re-acquire it when the page becomes visible again.
      const handleVisibilityChange = () => {
        if (wakeLockRef.current === null && document.visibilityState === 'visible') {
          requestWakeLock()
        }
      }

      // Initial request
      requestWakeLock()

      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        wakeLockRef.current?.release()
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }, [requestWakeLock])
}

export default useWakeLock
