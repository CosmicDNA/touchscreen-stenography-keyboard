import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

const usePeriodicFrame = (callback, { enabled = true, period = 0.1 }) => {
  const lastTimeRef = useRef(0)
  const discountRef = useRef(0)
  const { clock } = useThree()

  useEffect(() => {
    const handleVisibilityChange = () => {
      const elapsedClockTime = clock.getElapsedTime()
      if (document.hidden) {
        discountRef.current = lastTimeRef.current - elapsedClockTime
      } else {
        // When tab becomes visible again, reset the timer to the current elapsed time
        // to prevent the animation from "catching up" on missed frames.
        lastTimeRef.current = elapsedClockTime + discountRef.current
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [clock])

  useFrame(
    () => {
      if (enabled && !document.hidden) {
        const elapsed = clock.getElapsedTime() // total time in seconds
        if (elapsed >= lastTimeRef.current) {
          callback(lastTimeRef.current, Math.floor(lastTimeRef.current / period))
          lastTimeRef.current += period
        }
      }
    })
}

export default usePeriodicFrame
