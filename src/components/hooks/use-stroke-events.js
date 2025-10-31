import usePeriodicFrame from './use-periodic-frame'
import { useMemo, useRef } from 'react'

const resolution = 10

const useStrokeEvents = (straightForwardStrokes, { ratio = 6, enabled, nextObjectCallback = () => {}, nextStrokeCallback = () => {}, nextStrokeCallbackDT = () => {} }) => {
  const { allStenoKeys, cumulativeStrokeLengths } = useMemo(() => {
    const allStenoKeys = straightForwardStrokes.flatMap(o => o.steno)
    let cumulativeLength = 0
    const cumulativeStrokeLengths = straightForwardStrokes.map(stroke => {
      cumulativeLength += stroke.steno.length
      return cumulativeLength
    })
    return { allStenoKeys, cumulativeStrokeLengths }
  }, [straightForwardStrokes])

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

        const strokeIndex = cumulativeStrokeLengths.findIndex(len => iterator < len)

        // Check if the stroke object has changed since the last frame
        if (strokeIndex !== lastAnimatedStrokeIndex.current) {
          const strokeObject = straightForwardStrokes[strokeIndex]
          // Event: The stroke object has changed.
          // console.log('Next stroke:', strokeObject)
          nextObjectCallback(strokeObject)
          // Update the ref to the new index for the next check.
          lastAnimatedStrokeIndex.current = strokeIndex
        }
        // console.log(allStenoKeys[iterator])
        nextStrokeCallback(allStenoKeys[iterator], timeReference)
      }
    }
  }, { enabled })
}

export default useStrokeEvents
