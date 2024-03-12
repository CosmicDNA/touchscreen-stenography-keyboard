import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// eslint-disable-next-line no-unused-vars
import { dependencies } from './package.json'

const renderChunks = (manuallyDeclared) => {
  const flatManuallyDeclared = Object.values(manuallyDeclared).flat()
  return Object.fromEntries(
    Object.keys(dependencies)
      .filter(key => !flatManuallyDeclared.includes(key))
        .map((key) => [key, [key]])
    )
};

const three = ['three']
const r3f = ['react', 'react-dom', '@react-three/fiber', '@react-three/drei', '@use-gesture/react', 'react-json-pretty', 'react-json-pretty/themes/monikai.css', 'prop-types']
const rtk = ['react-redux', '@reduxjs/toolkit', '@reduxjs/toolkit/query/react', 'leva', 'use-sound', 'jotai', 'jotai/utils', 'react-use-websocket', 'socket.io-client', 'tunnel-rat', 'three-stdlib', '@mediapipe/tasks-vision']
const manuallyDeclared = { three, r3f, rtk }

export default defineConfig({
  plugins: [
    react(),
    // splitVendorChunkPlugin()
  ],
  build: {
    chunkSizeWarningLimit: 800,
    minify: true,
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          ...renderChunks(manuallyDeclared),
          ...manuallyDeclared
        }
      }
    }
  }
})