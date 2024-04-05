import { useEffect } from 'react'

/**
 *
 * @param {React.EffectCallback} callback
 * @param {React.DependencyList} deps
 */
const useOnMount = (callback, deps = []) => {
  useEffect(callback, deps)
}

export default useOnMount
