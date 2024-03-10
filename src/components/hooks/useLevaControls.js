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

let a = 0

const useLevaControls = ({ atom, useControlsParams }) => {
  const [folderName, useControlsOptions] = useControlsParams
  const [options, setOptions] = useAtom(atom)
  const [controls, setControls] = useControls(folderName, () => useControlsOptions)
  const [previousOptions, setPreviousOptions] = usePrevious(options, null)

  const deps = [previousOptions, options, controls].map(d => JSON.stringify(d))

  a = a + 1
  console.log({ a, previousOptions, options, controls })
  useEffect(() => {
    if (options) {
      if (deps[0] !== deps[1]) {
        console.log('There was an options update!')
        if (previousOptions !== null) {
          console.log('The last options update was not the update from null!')
          if (deps[2] !== deps[1]) {
            setControls(options)
            console.log('Set Controls!', options, deps)
          }
        }
      } else {
        console.log('There was not an options update!')
        if (deps[2] !== deps[1]) {
          console.log('There was a controls change!')
          setOptions(controls)
          setPreviousOptions(controls)
          console.log('Set Options!', controls, deps)
        }
      }
    }
  }, deps)

  return {
    loading: !deps.every(dep => dep === deps[0]),
    controls
  }
}

export default useLevaControls
export {
  getAtom
}
