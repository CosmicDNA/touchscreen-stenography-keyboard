import usePeriodicFrame from './use-periodic-frame'
import { useMemo, useRef } from 'react'

const useStrokeEvents = (straightForwardStrokes, { ratio = 6, pauseSeconds = 3, resolution = 10, enabled, nextObjectCallback = () => {}, nextStrokeCallback = () => {}, nextStrokeCallbackDT = () => {} }) => {
  const { allStenoKeys, cumulativeStrokeLengths } = useMemo(() => {
    if (!enabled) return { allStenoKeys: [], cumulativeStrokeLengths: [] }
    const originalStenoKeys = straightForwardStrokes.flatMap(o => o.steno)

    // Pad the array with nulls to create a pause at the end of the sequence.
    const padding = Array(pauseSeconds).fill(null)
    const allStenoKeys = [...originalStenoKeys, ...padding]

    let cumulativeLength = 0
    const cumulativeStrokeLengths = straightForwardStrokes.map(stroke => {
      cumulativeLength += stroke.steno.length
      return cumulativeLength
    })
    return { allStenoKeys, cumulativeStrokeLengths }
  }, [enabled, straightForwardStrokes, pauseSeconds])

  const lastAnimatedStrokeIndex = useRef(null)

  const ratioComplement = resolution - ratio

  usePeriodicFrame((timeReference, indexer) => {
    if (allStenoKeys.length > 0) {
      if ((indexer + ratioComplement) % resolution === 0) {
        nextStrokeCallbackDT(timeReference)
      }
      if (indexer % resolution === 0) {
        const index = indexer / resolution
        const iterator = index % allStenoKeys.length
        const currentKey = allStenoKeys[iterator]

        if (currentKey !== null) {
          // Not in pause...
          const strokeIndex = cumulativeStrokeLengths.findIndex(len => iterator < len)

          // Check if the stroke object has changed since the last frame
          if (strokeIndex !== lastAnimatedStrokeIndex.current) {
            const strokeObject = straightForwardStrokes[strokeIndex]
            // Event: The stroke object has changed.
            nextObjectCallback(strokeObject)
            // Update the ref to the new index for the next check.
            lastAnimatedStrokeIndex.current = strokeIndex
          }
          nextStrokeCallback(currentKey, timeReference)
        }
      }
    }
  }, { enabled })
}

export default useStrokeEvents
