import { useControls, folder } from 'leva'
import { useAtom } from 'jotai'
import { useMemo } from 'react'

/**
 * A hook to connect a Jotai atom to a Leva control panel.
 * @param {string} folderName - The name of the folder in the Leva panel.
 * @param {import('jotai').Atom} atom - The Jotai atom that holds the state for the controls.
 * @returns {object} The current value of the atom.
 */
const useJotaiLeva = (folderName, atom) => {
  const [value, setValue] = useAtom(atom)

  // This is the key: we build a Leva-compatible schema where each control
  // has its own `onChange` handler. This prevents state corruption from
  // Leva's folder-level `onChange` behavior.
  const schema = useMemo(() => {
    // Guard against running until the atom's value is initialized.
    if (!value) return null

    return Object.fromEntries(
      Object.entries(value).map(([key, controlValue]) => {
        const isComplex = typeof controlValue === 'object' && controlValue !== null && 'value' in controlValue

        const onChange = (newValue) => {
          setValue((prev) => ({
            ...prev,
            // Use `prev[key]` to avoid stale closures and ensure we're updating the latest state.
            [key]: isComplex ? { ...prev[key], value: newValue } : newValue
          }))
        }

        const dropIn = isComplex ? { ...controlValue } : { value: controlValue }
        const schemaEntry = { ...dropIn, onChange }

        return [key, schemaEntry]
      })
    )
  }, [value, setValue])

  // We pass the stable schema to `useControls`. No top-level `onChange` is needed.
  useControls(() => (schema ? { [folderName]: folder(schema, { collapsed: true }) } : {}), [schema])

  return value
}

export default useJotaiLeva
