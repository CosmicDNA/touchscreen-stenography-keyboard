import { useState, useEffect } from 'react'

const useUrlParam = (paramName) => {
  const [paramValue, setParamValue] = useState(null)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const value = urlParams.get(paramName)
    setParamValue(value)
  }, [paramName])

  return paramValue
}

export default useUrlParam
