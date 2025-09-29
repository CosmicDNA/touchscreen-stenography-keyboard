/* eslint-disable no-unused-vars */
import { useControls } from 'leva'
import { atomWithStorage } from 'jotai/utils'
import { editedObject } from '../utils/tools'
import { useAtom } from 'jotai'
import usePrevious from './usePrevious'

class CustomAtomWithStorage {
  constructor (aws, key) {
    this.aws = aws
    this.key = key
  }
}

const getAtomSelector = ([key, value]) => [key, value.value]
const getAtomWithStorage = (ops) => {
  const [[key, value]] = Object.entries(ops)
  const aws = atomWithStorage(
    key,
    editedObject(value, getAtomSelector),
    undefined,
    { getOnInit: true }
  )
  return new CustomAtomWithStorage(aws, key)
}

const transient = false
const getAugmentedControlOptions = (useControlsOptions, onChange) => {
  const selector = e => [e[0], { ...e[1], onChange: onChange(e[0]), transient }]
  return editedObject(useControlsOptions, selector)
}

/**
 *
 * @param {CustomAtomWithStorage} atom
 * @returns
 */
const getItemFromLocalStorage = atom =>
  JSON.parse(localStorage.getItem(atom.key))

/**
 *
 * @param {{atom: CustomAtomWithStorage, useControlsParams: [string, {[key: string]: { value: any }}]}} param0
 * @returns
 */
const useLevaControls = ({ atom, useControlsParams }) => {
  const [folderName, useControlsOptions] = useControlsParams
  // Get default values from the initial configuration
  const defaultValues = editedObject(useControlsOptions, getAtomSelector)
  const [storedOptions, setOptions] = useAtom(atom.aws)
  // Merge stored options with defaults to prevent errors on new options
  const options = { ...defaultValues, ...storedOptions }

  let initialising = true

  const onChange = p => v => {
    const previousValue = options[p]
    const item = getItemFromLocalStorage(atom)
    // console.log(item)
    const noKeySaved = !item
    // const detectedChange = previousValue !== v
    // console.log({ detectedChange, initialising, previousValue, v, p, noKeySaved, item, options })
    if (previousValue !== v && !initialising) {
      initialising = false
      // console.log(`Detected a change in ${p} from ${previousValue} to ${v}`)
      const newOptions = { ...options, [p]: v }
      setOptions(newOptions)
      setPreviousOptions(newOptions)
    } else {
      if (noKeySaved) {
        initialising = false
        // console.log('Never saved to local storage, saving now...')
        const newOptions = { ...options, [p]: v }
        setOptions(newOptions)
        setPreviousOptions(newOptions)
      } else {
        if (initialising) {
          initialising = false
          // console.log('This is a spurious attempt to revert options to the default value!')
          setControls(options)
        }
      }
    }
  }
  const augmentedControlOptions = getAugmentedControlOptions(useControlsOptions, onChange)

  const [controls, setControls] = useControls(folderName, () => augmentedControlOptions)

  const [previousOptions, setPreviousOptions] = usePrevious(options, null)
  const deps = [previousOptions, options, controls].map(d => JSON.stringify(d))

  const isLoading = !deps.every(dep => dep === deps[0])

  return {
    isLoading,
    controls
  }
}

export default useLevaControls
export {
  getAtomWithStorage
}
