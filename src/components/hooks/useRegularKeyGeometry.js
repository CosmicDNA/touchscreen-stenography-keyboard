import { useState, useEffect } from 'react'

// Define a standard unit size for a 1u keycap in Three.js units
const UNIT_SIZE = 1
// Define the spacing between keycaps
const KEY_SPACING = 0.1
// Default depth for all keys
const KEY_DEPTH = 0.5

/**
 * Custom hook to parse keyboard-layout-editor.com JSON and generate 3D key geometries.
 * @param {Array<Array<string|object>>} layoutJson - The keyboard layout JSON from KLE.
 * @returns {Array<object>} An array of key geometry objects, each describing a renderable 3D key segment.
 */
export const useRegularKeyGeometry = (layoutJson) => {
  const [keyGeometries, setKeyGeometries] = useState([])

  useEffect(() => {
    if (!layoutJson || layoutJson.length === 0) {
      setKeyGeometries([])
      return
    }

    const geometries = []
    let currentYBaseline = 0 // Y position for the current row's baseline (top edge of the row) in KLE units

    layoutJson.forEach((row, rowIndex) => {
      let currentXCursor = 0 // Reset X cursor for each new row. This is crucial.
      let lastKeyProps = {} // Stores properties from the last object encountered in the row

      row.forEach((item, itemIndex) => {
        if (typeof item === 'object') {
          // This item defines properties for the next key(s)
          lastKeyProps = { ...lastKeyProps, ...item }
        } else if (typeof item === 'string') {
          // Apply x/y offsets from lastKeyProps to the current cursor position
          // These offsets are *relative to the current cursor*, not absolute.
          currentXCursor += (lastKeyProps.x || 0) + KEY_SPACING
          const currentYCursor = currentYBaseline + (lastKeyProps.y || 0) * UNIT_SIZE

          const label = item
          const keyWidth = (lastKeyProps.w || 1) - KEY_SPACING
          const keyHeight = (lastKeyProps.h || 1) - KEY_SPACING
          const alignment = lastKeyProps.a || 4 // Text alignment (KLE 'a' property)

          // Calculate the top and bottom edges of the key relative to the current row's baseline
          // Calculate the center position for the first part of the key

          const posX1 = currentXCursor * UNIT_SIZE + (keyWidth / 2) * UNIT_SIZE
          const posY1 = currentYCursor + (keyHeight / 2) * UNIT_SIZE

          geometries.push({
            id: `key-${rowIndex}-${itemIndex}-part1`,
            label,
            position: [posX1, -posY1, 0], // Y is inverted for typical 3D scenes (positive Y is up)
            size: [keyWidth * UNIT_SIZE, keyHeight * UNIT_SIZE, KEY_DEPTH],
            alignment
          })

          // Handle split keys (e.g., Enter key with w2, h2, x2, y2)
          if (lastKeyProps.w2 && lastKeyProps.h2) {
            const keyWidth2 = (lastKeyProps.w2 || 1) - KEY_SPACING
            const keyHeight2 = (lastKeyProps.h2 || 1) - KEY_SPACING
            const xOffset2 = lastKeyProps.x2 || 0 // X offset for second part, relative to first part's origin
            const yOffset2 = lastKeyProps.y2 || 0 // Y offset for second part, relative to first part's origin (relative to currentYCursor)

            // Calculate the center position for the second part of the key
            // It's relative to the *start* of the current key's position (currentXCursor, currentYCursor)

            const posX2 = currentXCursor * UNIT_SIZE + xOffset2 * UNIT_SIZE + (keyWidth2 / 2) * UNIT_SIZE
            const posY2 = currentYCursor + yOffset2 * UNIT_SIZE + (keyHeight2 / 2) * UNIT_SIZE

            geometries.push({
              id: `key-${rowIndex}-${itemIndex}-part2`,
              label: '', // Labels typically only on the main part
              position: [posX2, -posY2, 0],
              size: [keyWidth2 * UNIT_SIZE, keyHeight2 * UNIT_SIZE, KEY_DEPTH],
              alignment
            })
          }

          // Advance currentX for the next key in the row
          // This advancement is based on the primary width (w) of the key, plus spacing
          currentXCursor += keyWidth
          lastKeyProps = {} // Reset properties after consuming them for a key
        }
      })
      // Advance the baseline for the next row by a standard 1u height + spacing.
      currentYBaseline += (UNIT_SIZE)
    })

    // --- Global Centering ---
    if (geometries.length === 0) {
      setKeyGeometries([])
      return
    }

    let minX = Infinity; let maxX = -Infinity
    let minY = Infinity; let maxY = -Infinity

    geometries.forEach(geo => {
      minX = Math.min(minX, geo.position[0] - geo.size[0] / 2)
      maxX = Math.max(maxX, geo.position[0] + geo.size[0] / 2)
      minY = Math.min(minY, geo.position[1] - geo.size[1] / 2)
      maxY = Math.max(maxY, geo.position[1] + geo.size[1] / 2)
    })

    const offsetX = (minX + maxX) / 2
    const offsetY = (minY + maxY) / 2

    const centeredGeometries = geometries.map(geo => ({
      ...geo,
      position: [geo.position[0] - offsetX, geo.position[1] - offsetY, geo.position[2]]
    }))
    setKeyGeometries(centeredGeometries)
  }, [layoutJson])

  return keyGeometries
}
