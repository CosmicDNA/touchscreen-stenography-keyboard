import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import { getCircularPoints, eqSet } from './utils/tools'
import { Vector2, Raycaster } from 'three'
import useMultiTouchDrag from './hooks/use-multi-touch-drag'
import { useThree } from '@react-three/fiber'
import { useTunnelContext } from './hooks/useTunnel'
import JSONPretty from 'react-json-pretty'

const fingerResolution = 6

// Create a unit circle model (radius 1) for the finger. We will scale this dynamically.
const unitFingerModel = getCircularPoints(
  fingerResolution,
  fingerResolution,
  1.0
)
const refUnitVectors = unitFingerModel.map(v => new Vector2(...v))

const rotationCentre = new Vector2(0, 0)

/**
 * Fallback for devices reporting an unrealistic touch radius.
 * If the reported radius is less than 5px, use a default of 24px.
 * @param {number} radius
 * @returns {number}
 */
const fallbackRadius = (radius) => {
  // Fallback for devices reporting an unrealistic touch radius.
  // If the reported radius is less than 5px, use a default of 24px.
  const MIN_RADIUS_PX = 5
  const DEFAULT_RADIUS_PX = 24
  return radius < MIN_RADIUS_PX ? DEFAULT_RADIUS_PX : radius
}

const KeyPressDetectionFloor = ({ size = 0.6, pressedKeys, updatePressedKeys, ...props }) => {
  const groupRef = useRef()
  const { camera, size: canvasSize } = useThree()
  // eslint-disable-next-line no-unused-vars
  const [data, setData] = useState([])

  const setFingerPressedKeys = (fingerId, newSet) => updatePressedKeys((map) => map.set(fingerId, newSet))
  const clearFingerPressedKeys = (fingerId) => updatePressedKeys((map) => map.delete(fingerId))

  /**
   * @param {{type: 'onDragStart' | 'onDragMove' | 'onDragEnd', touch: TouchEvent}} ev
   */
  const handleDrag = ({ touch, type }) => {
    const processDrag = () => {
      const keyMeshes = groupRef.current?.parent?.children
        .filter(c => c.name === 'key group')
        .map(g => g.children[0])
        .map(g => g.children[0])

      if (!keyMeshes) return

      const { clientX, clientY, radiusX, radiusY, rotationAngle, identifier } = touch

      // setData((d) => [...d, { rotationAngle, radiusX, radiusY }])

      // Convert touch center to Normalized Device Coordinates (NDC)
      const coords = new Vector2(
        (clientX / canvasSize.width) * 2 - 1,
        -(clientY / canvasSize.height) * 2 + 1
      )

      const effectiveRadiusX = fallbackRadius(radiusX)
      const effectiveRadiusY = fallbackRadius(radiusY)

      // Convert touch radius from CSS pixels to NDC scale
      const ndcRadiusX = effectiveRadiusX / canvasSize.width
      const ndcRadiusY = effectiveRadiusY / canvasSize.height

      // Convert rotation angle from degrees to radians.
      // The Touch API's rotation is clockwise, while Vector2.rotate() is counter-clockwise, so we negate it.
      const angleRad = -rotationAngle * (Math.PI / 180)

      // Scale the unit vectors to create an ellipse, rotate it, then translate to the touch coordinate.
      const fingerVectors = refUnitVectors.map(v =>
        v
          .clone()
          .multiply(new Vector2(ndcRadiusX, ndcRadiusY))
          .rotateAround(rotationCentre, angleRad)
          .add(coords)
      )
      const intersectedKeys = new Set([...fingerVectors.flatMap(v => {
        const raycaster = new Raycaster()
        raycaster.far = 50
        raycaster.setFromCamera(v, camera)
        return raycaster.intersectObjects(keyMeshes)
      }).map(o => o.object.userData.keyId)])

      const previousSet = pressedKeys.get(identifier)
      if (!eqSet(previousSet, intersectedKeys)) setFingerPressedKeys(identifier, intersectedKeys)
    }

    switch (type) {
      case 'onDragEnd':
        clearFingerPressedKeys(touch.identifier)
        break
      case 'onDragStart':
      case 'onDragMove':
        processDrag()
        break
    }
  }
  useMultiTouchDrag(handleDrag)

  const { status } = useTunnelContext()

  return (
    <group
      ref={groupRef}
      {...props}
    >
      {<status.In>
        <>
          {data.map((d, i) => {
            return (<JSONPretty key={i} data={d}/>)
          })}
        </>
      </status.In>}
    </group>
  )
}

KeyPressDetectionFloor.propTypes = {
  size: PropTypes.number,
  pressedKeys: PropTypes.instanceOf(Map),
  updatePressedKeys: PropTypes.func
}

export default KeyPressDetectionFloor
