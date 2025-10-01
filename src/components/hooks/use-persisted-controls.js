import { useControls as useLevaControls } from 'leva'
import { useCallback, useEffect, useMemo } from 'react'
import { debounce } from 'lodash'

const usePersistedControls = (folder, schema, options = {}) => {
  const {
    storageKey = `leva-${folder}`,
    debounceMs = 300,
    version = '1.0'
  } = options

  const versionedKey = `${storageKey}-v${version}`

  const loadPersistedData = useCallback(() => {
    try {
      const item = localStorage.getItem(versionedKey)
      if (!item) return null

      const data = JSON.parse(item)
      return data
    } catch (error) {
      console.warn('Failed to load persisted controls:', error)
      return null
    }
  }, [versionedKey])

  // Create the base save function
  const saveToStorage = useCallback((data) => {
    try {
      localStorage.setItem(versionedKey, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save controls:', error)
    }
  }, [versionedKey])

  // Create debounced version using useMemo
  const debouncedSave = useMemo(
    () => debounce(saveToStorage, debounceMs),
    [saveToStorage, debounceMs]
  )

  const persistedData = loadPersistedData()
  const mergedSchema = { ...schema }

  // Merge persisted data with schema
  if (persistedData) {
    Object.keys(schema).forEach(key => {
      if (persistedData[key] !== undefined) {
        mergedSchema[key] = {
          ...schema[key],
          value: persistedData[key]
        }
      }
    })
  }

  const controls = useLevaControls(folder, mergedSchema)

  useEffect(() => {
    debouncedSave(controls)
  }, [controls, debouncedSave])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSave.flush()
    }
  }, [debouncedSave])

  return controls
}

export default usePersistedControls
