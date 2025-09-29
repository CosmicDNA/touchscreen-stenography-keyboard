import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { Color, ExtrudeGeometry } from 'three'
import useMount from './hooks/useMount'
import { Text3D } from '@react-three/drei'
import InterMediumRegular from '../fonts/Inter_Medium_Regular.json'

/**
 * Represents a Key component.
 * @typedef {Object} KeyProps
 * @property {String} keyId - The unique identifier for the key.
 * @property {Set<String>} allKeys - Set of pressed keys.
 * @property {...any} props - Additional props.
 */

/**
 * Key component.
 * @param {KeyProps} props - The props object.
 */
const AnyKey = ({ geometry, offsetX = 0, offsetY = 0, scale = 1, lateral = 7 / 10, keyId, allKeys, armLength, ...props }) => {
  const { onKeyPress, onKeyRelease } = props
  const { isMounted } = useMount()

  const pressed = allKeys.has(keyId)

  // Watch for changes in the 'pressed' variable
  useEffect(() => {
    if (isMounted) {
      if (pressed) {
        // Trigger onKeyPress event here when 'pressed' becomes true
        onKeyPress(keyId)
      } else {
        // Trigger onKeyRelease event here when 'pressed' becomes false
        onKeyRelease(keyId)
      }
    }
  }, [pressed])

  const colorA = '#90B6AF'
  const colorB = Color.NAMES.whitesmoke

  return (
    <group
      {...props}
      name='key group'
    >
      <group
        // eslint-disable-next-line react/no-unknown-property
        rotation-x={pressed ? Math.PI / 32 / armLength : 0}
        // eslint-disable-next-line react/no-unknown-property
        position-y={armLength}
      >
        <mesh
          // eslint-disable-next-line react/no-unknown-property
          position-y={-lateral - armLength}
          // eslint-disable-next-line react/no-unknown-property
          userData={{ keyId }}
          // eslint-disable-next-line react/no-unknown-property
          geometry={geometry}
        >
          {[colorA, colorB].map((color, i) =>
            // eslint-disable-next-line react/no-unknown-property
            <meshLambertMaterial key={i} attach={`material-${i}`} args={[{ color, wireframe: false }]} />
          )}
        </mesh>
        <Text3D font={InterMediumRegular} size={0.2 * scale} height={0.01} position={[-0.07 + offsetX, -0.6 + offsetY - armLength, 0.1]}>
          {keyId.replace('-', '')}
        </Text3D>
      </group>
    </group>
  )
}

AnyKey.propTypes = {
  geometry: PropTypes.instanceOf(ExtrudeGeometry),
  scale: PropTypes.number,
  offsetX: PropTypes.number,
  offsetY: PropTypes.number,
  keyId: PropTypes.string.isRequired,
  lateral: PropTypes.number,
  armLength: PropTypes.number,
  roundResolution: PropTypes.number,
  onKeyPress: PropTypes.func.isRequired,
  onKeyRelease: PropTypes.func.isRequired,
  allKeys: PropTypes.instanceOf(Set).isRequired
}

export default AnyKey
