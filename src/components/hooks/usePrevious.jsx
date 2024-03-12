import { useRef, useEffect } from 'react'

const usePrevious = (value, defaultValue) => {
  const ref = useRef(defaultValue)
  const setPrevious = value => {
    ref.current = value
  }
  useEffect(() => {
    ref.current = value
  })
  const previous = ref.current
  return [previous, setPrevious]
}

export default usePrevious
