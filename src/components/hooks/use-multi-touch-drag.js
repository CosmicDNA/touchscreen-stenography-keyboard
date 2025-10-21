import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'

/**
 * A hook to handle multi-touch drag gestures on the R3F canvas.
 * @param {Function} handler - The function to call on drag events.
 *   It receives an object with { type: 'onDragStart' | 'onDragMove' | 'onDragEnd', fingerId: number, touch: Touch }.
 */
const useMultiTouchDrag = (handler) => {
  const { gl } = useThree()
  // Ref to store currently tracked touches. Maps touch.identifier to the Touch object.
  const trackedTouches = useRef(new Map())

  useEffect(() => {
    const element = gl.domElement
    if (!element) return

    /**
     *
     * @param {TouchEvent} evt
     */
    const handleStart = ({ changedTouches, preventDefault }) => {
      preventDefault() // Prevent default browser actions (like scrolling, zooming)

      for (const touch of changedTouches) {
        trackedTouches.current.set(touch.identifier, touch)
        handler({ type: 'onDragStart', touch })
      }
    }

    /**
     *
     * @param {TouchEvent} evt
     */
    const handleMove = ({ changedTouches, preventDefault }) => {
      preventDefault() // Prevent default browser actions (like scrolling, zooming)

      for (const touch of changedTouches) {
        if (trackedTouches.current.has(touch.identifier)) {
          trackedTouches.current.set(touch.identifier, touch) // Update touch data
          handler({ type: 'onDragMove', touch })
        }
      }
    }

    /**
     *
     * @param {TouchEvent} evt
     */
    const handleEnd = ({ changedTouches, preventDefault }) => {
      preventDefault() // Prevent default browser actions (like scrolling, zooming)

      for (const touch of changedTouches) {
        if (trackedTouches.current.has(touch.identifier)) {
          handler({ type: 'onDragEnd', touch })
          trackedTouches.current.delete(touch.identifier) // Remove from tracking
        } else {
          console.log("can't figure out which touch to end")
        }
      }
    }

    /**
     *
     * @param {TouchEvent} evt
     */
    const handleCancel = ({ changedTouches, preventDefault }) => {
      preventDefault() // Prevent default browser actions (like scrolling, zooming)

      for (const touch of changedTouches) {
        if (trackedTouches.current.has(touch.identifier)) {
          trackedTouches.current.delete(touch.identifier) // Remove from tracking
        }
      }
    }

    // Add native event listeners
    element.addEventListener('touchstart', handleStart)
    element.addEventListener('touchend', handleEnd)
    element.addEventListener('touchcancel', handleCancel) // Treat cancel the same as end
    element.addEventListener('touchmove', handleMove)

    // Cleanup function to remove event listeners
    return () => {
      element.removeEventListener('touchstart', handleStart)
      element.removeEventListener('touchend', handleEnd)
      element.removeEventListener('touchcancel', handleCancel)
      element.removeEventListener('touchmove', handleMove)
    }
  }, [handler, gl.domElement])
}

export default useMultiTouchDrag
