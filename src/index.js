import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App'
import { Leva } from 'leva'

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <Leva collapsed/>
  </>
)
