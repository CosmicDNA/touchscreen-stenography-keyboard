/* eslint-disable no-unused-vars */
import { useEffect } from 'react'
import { useControls } from 'leva'
import { atomWithStorage } from 'jotai/utils'
import { editedObject } from '../utils/tools'
import { useAtom } from 'jotai'
import usePrevious from './usePrevious'

const getAtomSelector = ([key, value]) => [key, value.value]
const getAtomWithStorage = (ops) => {
  const entry = Object.entries(ops)[0]
  return atomWithStorage(
    entry[0],
    editedObject(entry[1], getAtomSelector)
  )
}

const transient = false
const getAugmentedControlOptions = (useControlsOptions, onChange) => {
  const selector = e => [e[0], { ...e[1], onChange: onChange(e[0]), transient }]
  return editedObject(useControlsOptions, selector)
}

const useLevaControls = ({ atom, useControlsParams }) => {
  const [folderName, useControlsOptions] = useControlsParams
  const [options, setOptions] = useAtom(atom)

  let notInitialising = false

  const onChange = p => v => {
    const defaultValue = controls[p]
    // console.log({ p, v, defaultValue })
    if (defaultValue !== v || notInitialising) {
      notInitialising = true
      // console.log(`Detected a change in ${p} to ${v}`)
      const newOptions = { ...options, [p]: v }
      setOptions(newOptions)
      setPreviousOptions(newOptions)
    }
  }
  const augmentedControlOptions = getAugmentedControlOptions(useControlsOptions, onChange)

  const [controls, setControls] = useControls(folderName, () => augmentedControlOptions)

  const [previousOptions, setPreviousOptions] = usePrevious(options, null)
  const deps = [previousOptions, options, controls].map(d => JSON.stringify(d))

  useEffect(() => {
    if (options) {
      if (deps[0] !== deps[1]) {
        // console.log('There was an options update!')
        if (previousOptions !== null) {
          // console.log('The last options update was not the update from null!')
          if (deps[2] !== deps[1]) {
            setControls(options)
            // console.log(options)
            // console.log(previousOptions)
            // console.log('Set Controls!', deps)
          }
        }
      }
    }
  }, deps)

  const loading = !deps.every(dep => dep === deps[0])

  return {
    loading,
    controls
  }
}

export default useLevaControls
export {
  getAtomWithStorage
}
