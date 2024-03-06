import { useEffect } from 'react'
import { useControls } from 'leva'
import { atomWithStorage } from 'jotai/utils'
import { useAtom } from 'jotai'
import usePrevious from './usePrevious'

const getAtom = (ops) => {
  const entry = Object.entries(ops)[0]
  return atomWithStorage(
    entry[0],
    Object.fromEntries(
      Object.entries(entry[1]).map(([key, value]) => [key, value.value])
    )
  )
}

const useLevaControls = ({ atom, useControlsParams }) => {
  const [folderName, useControlsOptions] = useControlsParams
  const [options, setOptions] = useAtom(atom)
  const [controls, setControls] = useControls(folderName, () => useControlsOptions)
  const previousOptions = usePrevious(options)

  const deps = [previousOptions, options, controls].map(d => JSON.stringify(d))

  useEffect(() => {
    if (options) {
      if (deps[0] !== deps[1]) {
        if (!previousOptions.length) {
          setControls(options)
        }
      } else {
        if (deps[2] !== deps[1]) {
          setOptions(controls)
        }
      }
    }
  }, deps)

  return controls
}

export default useLevaControls
export {
  getAtom
}
