import { useEffect } from 'react'

/**
 * A hook to request fullscreen on the first user interaction (click).
 * This is necessary because browsers require a user gesture to enter fullscreen mode.
 */
const useFullScreen = () => {
  useEffect(() => {
    const goFullscreen = async () => {
      if (!document.fullscreenElement) {
        try {
          await document.documentElement.requestFullscreen()
        } catch (err) {
          // It's good practice to log errors for debugging, but not show them to the user unless necessary.
          console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`)
        }
      }
    }

    document.addEventListener('click', goFullscreen, { once: true })

    return () => document.removeEventListener('click', goFullscreen)
  }, []) // Empty dependency array ensures this effect runs only once on mount.
}

export default useFullScreen
