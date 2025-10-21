import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'

/**
 * A hook to handle multi-touch drag gestures on the R3F canvas.
 * @param {Function} handler - The function to call on drag events. It receives the Hammer.js event object.
 */
const useMultiTouchDrag = (handler) => {
  const { gl } = useThree()
  // Refs to manage the state of touches and available finger IDs.
  const trackedPointers = useRef(new Map())
  const fingerIdPool = useRef(Array.from({ length: 10 }, (_, i) => i)) // Pool of IDs 0-9

  useEffect(() => {
    const element = gl.domElement
    if (!element) return

    const handlePointerDown = (event) => {
      // Prevent default browser actions (like text selection or page scrolling on mobile)
      // event.preventDefault()
      element.setPointerCapture(event.pointerId)

      if (fingerIdPool.current.length > 0) {
        const fingerId = fingerIdPool.current.shift() // Get lowest available ID
        trackedPointers.current.set(event.pointerId, { fingerId, pointer: event })
        handler({ type: 'onDragStart', fingerId, pointer: event })
      }
    }

    const handlePointerMove = (event) => {
      const tracked = trackedPointers.current.get(event.pointerId)
      if (tracked) {
        tracked.pointer = event // Update pointer data
        handler({ type: 'onDragMove', fingerId: tracked.fingerId, pointer: event })
      }
    }

    const handlePointerUp = (event) => {
      element.releasePointerCapture(event.pointerId)
      const tracked = trackedPointers.current.get(event.pointerId)
      if (tracked) {
        const { fingerId } = tracked
        handler({ type: 'onDragEnd', fingerId, pointer: event })
        trackedPointers.current.delete(event.pointerId)
        fingerIdPool.current.push(fingerId) // Return ID to the pool
        fingerIdPool.current.sort((a, b) => a - b) // Keep pool sorted
      }
    }

    // Add native event listeners
    element.addEventListener('pointerdown', handlePointerDown)
    element.addEventListener('pointermove', handlePointerMove)
    element.addEventListener('pointerup', handlePointerUp)
    element.addEventListener('pointercancel', handlePointerUp) // Treat cancel like up

    // Cleanup function to remove event listeners
    return () => {
      element.removeEventListener('pointerdown', handlePointerDown)
      element.removeEventListener('pointermove', handlePointerMove)
      element.removeEventListener('pointerup', handlePointerUp)
      element.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [handler, gl.domElement])
}

export default useMultiTouchDrag

/*
// Usage example in a React Three Fiber component:
import useMultiTouchDrag from './hooks/use-multi-touch-drag'

function MyDraggableComponent(props) {
  useMultiTouchDrag((hammerEvent) => {
    console.log('Active pointers:', hammerEvent.pointers.length);
  });
  return <group {...props} />;
}
*/
