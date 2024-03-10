import { useState, useEffect } from 'react'

const useProtocol = (secret, notLoadedYet) => {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!notLoadedYet) {
      const getData = async () => {
        const res = await fetch('http://localhost:8086/protocol', {
          method: 'GET',
          headers: {
            Authorization: `Token ${secret}`
          }
        })
        setLoading(false)
        if (!res.ok) {
          const error = new Error(res.statusText)
          error.name = 'Fetch error on useProtocol hook'
          error.stack = res
          setError(error)
        }
        const data = await res.json()
        setData(data)
      }
      getData()
    }
  }, [notLoadedYet, secret])

  return {
    loading,
    error,
    data
  }
}

export default useProtocol
