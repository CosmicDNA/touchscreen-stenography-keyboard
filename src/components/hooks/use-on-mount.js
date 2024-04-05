import { useEffect } from 'react'

/**
 *
 * @param {Function} callback
 * @param {Array} deps
 */
const useOnMount = (callback, deps = []) => {
  useEffect(callback, deps)
}

export default useOnMount
