import { createContext, useContext } from 'react'

const TunnelContext = createContext()
const useTunnelContext = () => useContext(TunnelContext)

export { useTunnelContext, TunnelContext }