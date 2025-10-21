import { useEffect } from 'react'
import Hammer from 'hammerjs'
import { useThree } from '@react-three/fiber'

/**
 * A hook to handle multi-touch drag gestures on the R3F canvas.
 * @param {Function} handler - The function to call on drag events. It receives the Hammer.js event object.
 */
const useMultiTouchDrag = (handler) => {
  const { gl } = useThree()

  useEffect(() => {
    const element = gl.domElement
    if (!element) return

    // Instantiate Hammer.js on the element.
    const hammerManager = new Hammer.Manager(element)
    // Create a pan recognizer that tracks all pointers.
    const tap = new Hammer.Tap()
    const pan = new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, pointers: 0 })
    hammerManager.add([pan, tap])

    // Attach the handler to Hammer's pan events.
    hammerManager.on('panstart panmove panend pancancel tap', handler)

    // Cleanup function to destroy the Hammer instance when the component unmounts or target changes.
    return () => {
      hammerManager.destroy()
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
