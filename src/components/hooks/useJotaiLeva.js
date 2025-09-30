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

    const schemaDefinition = {}
    for (const key in value) {
      const controlValue = value[key]
      const isComplex = typeof controlValue === 'object' && controlValue !== null && 'value' in controlValue

      // The `onChange` for each control will update only its own key in the Jotai atom.
      const onChange = (newValue) => {
        setValue((prev) => ({
          ...prev,
          // For complex controls, we update the `value` property within the object. For primitive controls, we just set the new value.
          [key]: isComplex ? { ...value[key], value: newValue } : newValue
        }))
      }

      if (isComplex) {
        schemaDefinition[key] = { ...controlValue, onChange }
      } else {
        schemaDefinition[key] = { value: controlValue, onChange }
      }
    }
    return schemaDefinition
  }, [value, setValue])

  // We pass the stable schema to `useControls`. No top-level `onChange` is needed.
  useControls(() => (schema ? { [folderName]: folder(schema, { collapsed: true }) } : {}), [schema])

  return value
}

export default useJotaiLeva
