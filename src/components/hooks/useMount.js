import { useEffect, useRef } from 'react'

const useMount = () => {
// Ref to track component mount state
  const isMounted = useRef(false)

  useEffect(() => {
    // Component has mounted, set the flag
    isMounted.current = true

    // Cleanup function to reset the flag when component unmounts
    return () => {
      isMounted.current = false
    }
  }, [])

  return { isMounted: isMounted.current }
}

export default useMount
