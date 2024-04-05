import { useRef } from 'react'
import useOnMount from './use-on-mount'

/**
 *
 * @param {Function} callback
 * @param {Array} deps
 * @returns
 */
const useMount = (callback = () => {}, deps = []) => {
// Ref to track component mount state
  const isMounted = useRef(false)

  useOnMount(() => {
    // Component has mounted, set the flag
    if (!isMounted.current) {
      isMounted.current = true
      callback()
    }

    // Cleanup function to reset the flag when component unmounts
    return () => {
      isMounted.current = false
    }
  }, deps)

  return { isMounted: isMounted.current }
}

export default useMount
