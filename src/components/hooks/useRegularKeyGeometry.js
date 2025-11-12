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
    let currentYOffset = 0 // Tracks the Y offset for the current row's baseline
    let maxKeyboardWidth = 0 // To help center the entire keyboard

    layoutJson.forEach((row, rowIndex) => {
      let currentX = 0 // X position for the current key in the row (left edge)
      let lastKeyProps = {} // Stores properties from the last object encountered in the row
      let maxKeyHeightInRow = 1 // Track max height in current row for next row's Y offset

      row.forEach((item, itemIndex) => {
        if (typeof item === 'object') {
          // This item defines properties for the next key(s)
          lastKeyProps = { ...lastKeyProps, ...item }
        } else if (typeof item === 'string') {
          // This item is a keycap label, apply lastKeyProps to it
          const label = item
          const keyWidth = lastKeyProps.w || 1
          const keyHeight = lastKeyProps.h || 1
          const xOffset = lastKeyProps.x || 0 // X offset from currentX
          const yOffset = lastKeyProps.y || 0 // Y offset from currentY
          const alignment = lastKeyProps.a || 4 // Text alignment (KLE 'a' property)

          // Calculate the center position for the first part of the key
          const posX1 = currentX + xOffset * UNIT_SIZE + (keyWidth / 2) * UNIT_SIZE
          const posY1 = currentYOffset + yOffset * UNIT_SIZE + (keyHeight / 2) * UNIT_SIZE

          geometries.push({
            id: `key-${rowIndex}-${itemIndex}-part1`,
            label,
            position: [posX1, -posY1, 0], // Y is inverted for typical 3D scenes (positive Y is up)
            size: [keyWidth * UNIT_SIZE, keyHeight * UNIT_SIZE, KEY_DEPTH],
            alignment
          })

          // Handle split keys (e.g., Enter key with w2, h2, x2, y2)
          if (lastKeyProps.w2 && lastKeyProps.h2) {
            const keyWidth2 = lastKeyProps.w2 || 1
            const keyHeight2 = lastKeyProps.h2 || 1
            const xOffset2 = lastKeyProps.x2 || 0 // X offset for second part, relative to first part's origin
            const yOffset2 = lastKeyProps.y2 || 0 // Y offset for second part, relative to first part's origin

            // Calculate the center position for the second part of the key
            // It's relative to the *start* of the current key's position (currentX, currentYOffset)
            const posX2 = currentX + xOffset * UNIT_SIZE + xOffset2 * UNIT_SIZE + (keyWidth2 / 2) * UNIT_SIZE
            const posY2 = currentYOffset + yOffset * UNIT_SIZE + yOffset2 * UNIT_SIZE + (keyHeight2 / 2) * UNIT_SIZE

            geometries.push({
              id: `key-${rowIndex}-${itemIndex}-part2`,
              label: '', // Labels typically only on the main part
              position: [posX2, -posY2, 0],
              size: [keyWidth2 * UNIT_SIZE, keyHeight2 * UNIT_SIZE, KEY_DEPTH],
              alignment
            })
            maxKeyHeightInRow = Math.max(maxKeyHeightInRow, keyHeight2) // Consider height of second part
          }

          maxKeyHeightInRow = Math.max(maxKeyHeightInRow, keyHeight) // Track max height in current row
          // Advance currentX for the next key in the row
          // This advancement is based on the primary width (w) of the key
          currentX += (keyWidth + KEY_SPACING) * UNIT_SIZE
          lastKeyProps = {} // Reset properties after consuming them for a key
        }
      })
      // Update maxKeyboardWidth for centering calculation
      maxKeyboardWidth = Math.max(maxKeyboardWidth, currentX)
      // Advance currentYOffset for the next row
      currentYOffset += (maxKeyHeightInRow * UNIT_SIZE + KEY_SPACING)
    })

    // Center the entire keyboard horizontally
    const centeredGeometries = geometries.map((geo) => ({
      ...geo,
      position: [geo.position[0] - maxKeyboardWidth / 2, geo.position[1], geo.position[2]]
    }))

    setKeyGeometries(centeredGeometries)
  }, [layoutJson])

  return keyGeometries
}
