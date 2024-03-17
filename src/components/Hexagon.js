import PropTypes from 'prop-types'
import React from 'react'
import { Vector3, Shape } from 'three'
import { getCircularPoints } from './utils/tools'
import useDrag from './hooks/useDrag'

const Hexagon = ({ radius = 1, name, color, pressedKeys, updatePressedKeys, ...props }) => {
  const keyId = name
  const dragProps = useDrag({ keyId, pressedKeys, updatePressedKeys })
  const underSemiCircumference = getCircularPoints(
    6,
    6,
    radius,
    Math.PI
  )
  const coordinatesList = underSemiCircumference
    .map(n => new Vector3(n[0], n[1], 0))

  // const opacity = 0.05
  const opacity = 0

  return (
    <group
      {...dragProps}
      {...props}
    >
      {/* eslint-disable-next-line react/no-unknown-property */}
      <mesh userData={{ keyId }}>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <meshStandardMaterial attach='material' color={color} opacity={opacity} depthWrite={false} transparent={true}/>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <shapeGeometry args={[new Shape(coordinatesList)]} {...props} />
      </mesh>
    </group>
  )
}

Hexagon.propTypes = {
  radius: PropTypes.number,
  name: PropTypes.string.isRequired,
  color: PropTypes.string,
  pressedKeys: PropTypes.instanceOf(Map).isRequired,
  updatePressedKeys: PropTypes.func.isRequired
}

export default Hexagon
