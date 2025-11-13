/* eslint-disable no-unused-vars */
import { useMemo } from 'react'
import { Shape, Vector2, ExtrudeGeometry } from 'three'

// Define the spacing between keycaps
const KEY_SPACING = 0.12 // gap between keys
// Default depth for all keys
const KEY_DEPTH = 1 / 20 // Match steno key depth

const extrudeSettings = {
  depth: KEY_DEPTH,
  steps: 1,
  bevelEnabled: true,
  bevelThickness: 8 / 200, // From steno key
  bevelSize: 0.4 * 8 / 40, // From steno key
  bevelSegments: 1
}

/**
 * Converts a KLE row array into a consistent array of objects,
 * where each object represents a key and has its own dimension properties.
 * @param {Array<string|object>} arr The row array from KLE JSON.
 * @returns {Array<{label: string, props: object}>}
 */
function convertToObjects (arr) {
  const result = []
  let currentProps = {}
  let xCursor = 0
  arr.forEach(item => {
    const current = item
    if (typeof current === 'object') {
      currentProps = { ...currentProps, ...current }
    } else if (typeof current === 'string') {
      // Apply x offset before placing the key
      xCursor += (currentProps.x || 0)
      result.push({ label: current, props: { ...currentProps, x: xCursor } })
      xCursor += (currentProps.w || 1)
      // Reset props that don't carry over to the next key automatically (like w, h, x, y)
      currentProps = { a: currentProps.a }
    }
  })
  return result
}

/**
 * Custom hook to parse keyboard-layout-editor.com JSON and generate 3D key geometries.
 * @param {Array<Array<string|object>>} layoutJson - The keyboard layout JSON from KLE.
 * @returns {Array<object>} An array of key geometry objects, each describing a renderable 3D key segment.
 */
export const useRegularKeyGeometry = (layoutJson) => {
  const keyGeometries = useMemo(() => {
    return layoutJson.map((row, rowIndex) => {
      const rowGeometries = convertToObjects(row).map((item, itemIndex) => {
        const { label, props } = item

        const currentXCursor = props.x
        const currentYCursor = rowIndex

        // Visual dimensions are shrunk to create the gap
        const w = (props.w || 1) - KEY_SPACING
        const h = (props.h || 1) - KEY_SPACING
        const w2 = (props.w2 || 0)
        const h2 = (props.h2 || 0)
        const x2 = (props.x2 || 0)
        const y2 = (props.y2 || 0)
        const alignment = props.a || 4

        const points1 = [
          [0, 0], // bottom left
          [w - KEY_SPACING, 0], // bottom right
          [w - KEY_SPACING, h - KEY_SPACING], // top right
          [0, h - KEY_SPACING] // top left
        ]

        let points
        if (w2) {
          // const points2 = [
          //   [x2 + w2 - 2 * KEY_SPACING, h2 - 2 * KEY_SPACING], // top right
          //   [x2 + w2 - 2 * KEY_SPACING, 0], // bottom right
          //   [x2, 0], // bottom left
          //   [x2, h2 - 2 * KEY_SPACING] // top left
          // ]
          // const slicedPoints2 = points2.slice(1)
          const slicedPoints2 = [
            [x2 + w2 - 2 * KEY_SPACING, 0], // bottom right
            [x2, 0], // bottom left
            [x2, h2 - 2 * KEY_SPACING] // top left
          ]
          const processedPoints1 = points1.slice(2).reverse()

          points = slicedPoints2
            .concat([[processedPoints1[0][0], slicedPoints2[2][1]]])
            .concat(processedPoints1)
        } else {
          points = points1
        }

        // Create the 2D shape for the keycap, accounting for spacing
        const keyShape = new Shape(points.map(p => new Vector2(...p)))

        const geometry = new ExtrudeGeometry(keyShape, extrudeSettings)

        // Position the key's group based on the layout cursor
        const posX = currentXCursor
        const posY = currentYCursor

        return {
          id: `key-${rowIndex}-${itemIndex}`,
          label,
          position: [posX, -posY - y2],
          size: [w, h, KEY_DEPTH], // For text positioning
          alignment,
          geometry
        }
      })

      return rowGeometries
    })
  }, [layoutJson])

  return keyGeometries
}
