import React, { createContext, useContext } from 'react'
import PropTypes from 'prop-types'
import tunnel from 'tunnel-rat'

const TunnelContext = createContext()

const useTunnelContext = () => useContext(TunnelContext)

const TunnelProvider = ({ children }) => {
  const status = tunnel()

  return (
    <TunnelContext.Provider value={{
      status
    }}>
      {children}
    </TunnelContext.Provider>
  )
}

TunnelProvider.propTypes = {
  children: PropTypes.any
}

export { useTunnelContext, TunnelProvider }
