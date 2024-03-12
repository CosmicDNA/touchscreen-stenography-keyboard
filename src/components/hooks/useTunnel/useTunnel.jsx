import PropTypes from 'prop-types'
import tunnel from 'tunnel-rat'
import { TunnelContext } from './useTunnelContext'


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

export { TunnelProvider }
