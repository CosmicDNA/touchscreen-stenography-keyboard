import React, { useState, createContext, useContext } from 'react'
import PropTypes from 'prop-types'
import { CycleRaycast } from '@react-three/drei'

// Create a context
const CycleRaycastContext = createContext()

// Custom hook to use the context value
const useCycleRaycastContext = () => {
  return useContext(CycleRaycastContext)
}

// Context provider component
const CycleRaycastContextProvider = ({ children }) => {
  const [cycleRayCastState, setCycleRayCastState] = useState({
    objects: [],
    cycle: 0
  })

  return (
    <CycleRaycastContext.Provider value={{ cycleRayCastState, setCycleRayCastState, CycleRaycast }}>
      {children}
    </CycleRaycastContext.Provider>
  )
}

CycleRaycastContextProvider.propTypes = {
  children: PropTypes.any
}

export { CycleRaycastContextProvider, useCycleRaycastContext }
