import PropTypes from 'prop-types'
import React from 'react'
import useDrag from './hooks/useDrag'
import { ShapeGeometry } from 'three'

const Hexagon = ({ geometry, name, color, pressedKeys, updatePressedKeys, ...props }) => {
  const keyId = name
  const dragProps = useDrag({ keyId, pressedKeys, updatePressedKeys })

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
        <primitive
          // eslint-disable-next-line react/no-unknown-property
          object={geometry}
          // eslint-disable-next-line react/no-unknown-property
          attach='geometry'
          {...props} />
      </mesh>
    </group>
  )
}

Hexagon.propTypes = {
  geometry: PropTypes.instanceOf(ShapeGeometry).isRequired,
  name: PropTypes.string.isRequired,
  color: PropTypes.string,
  pressedKeys: PropTypes.instanceOf(Map).isRequired,
  updatePressedKeys: PropTypes.func.isRequired
}

export default Hexagon
