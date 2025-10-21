import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'

/**
 * A hook to handle multi-touch drag gestures on the R3F canvas.
 * @param {Function} handler - The function to call on drag events.
 *   It receives an object with { type: 'onDragStart' | 'onDragMove' | 'onDragEnd', nativeType: string, touch: Touch }.
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
    const handleStart = (evt) => {
      evt.preventDefault() // Prevent default browser actions (like scrolling, zooming)

      for (const touch of evt.changedTouches) {
        trackedTouches.current.set(touch.identifier, touch)
        handler({ type: evt.type, touch })
      }
    }

    /**
     *
     * @param {TouchEvent} evt
     */
    const handleMove = (evt) => {
      evt.preventDefault() // Prevent default browser actions (like scrolling, zooming)

      for (const touch of evt.changedTouches) {
        if (trackedTouches.current.has(touch.identifier)) {
          trackedTouches.current.set(touch.identifier, touch) // Update touch data
          handler({ type: evt.type, touch })
        }
      }
    }

    /**
     *
     * @param {Boolean} end
     * @returns {function(TouchEvent): void}
     */
    const handleDelete = (end) =>
      /**
       * Inner function that adds the outer parameter to its own parameter.
       *
       * @param {TouchEvent} evt - The touch event.
       */
      (evt) => {
        evt.preventDefault() // Prevent default browser actions (like scrolling, zooming)

        for (const touch of evt.changedTouches) {
          if (trackedTouches.current.has(touch.identifier)) {
            handler({ type: evt.type, touch })
            trackedTouches.current.delete(touch.identifier) // Remove from tracking
          } else {
            if (end) console.log("can't figure out which touch to end")
          }
        }
      }

    const listeners = [
      { type: 'touchstart', handler: handleStart },
      { type: 'touchmove', handler: handleMove },
      { type: 'touchend', handler: handleDelete(true) },
      { type: 'touchcancel', handler: handleDelete(false) }
    ]

    /**
     *
     * @param {'addEventListener' | 'removeEventListener'} method
     */
    const processListeners = (method) => {
      listeners.forEach(({ type, handler }) => {
        element[method](type, handler)
      })
    }

    // Add native event listeners
    processListeners('addEventListener')

    // Cleanup function to remove event listeners
    return () => {
      processListeners('removeEventListener')
    }
  }, [handler, gl.domElement])
}

export default useMultiTouchDrag
