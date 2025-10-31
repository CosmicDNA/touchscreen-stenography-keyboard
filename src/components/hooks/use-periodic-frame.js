import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const usePeriodicFrame = (callback, { enabled = true, period = 0.1 }) => {
  const lastTimeRef = useRef(0)

  useFrame(
    ({ clock }) => {
      if (enabled) {
        const elapsed = clock.getElapsedTime() // total time in seconds
        // Check if enough time has passed for the next "tick"
        if (elapsed >= lastTimeRef.current) {
          callback(lastTimeRef.current, Math.floor(lastTimeRef.current / period))
          // Increment the last trigger time by the interval to prevent drift.
          lastTimeRef.current += period
        }
      }
    })
}

export default usePeriodicFrame
