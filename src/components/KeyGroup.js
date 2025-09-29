import React, { memo } from 'react'
import PropTypes from 'prop-types'
import AnyKey from './AnyKey'
import { Vector3, Material } from 'three'
import useKeyGeometry from './hooks/useKeyGeometry' // Import Material

const RawKey = ({ geometry, name, position, theKey, i, ...props }) => {
  const getKey = (key, attribute) => {
    return key[attribute] ? key[attribute] : 0
  }
  const offsetX = getKey(theKey, 'ox')
  const offsetY = getKey(theKey, 'oy')
  const offsetZ = getKey(theKey, 'oz')
  return (
    <AnyKey
      geometry={geometry}
      position={[position.x + i + offsetX, position.y + offsetY, position.z + offsetZ]}
      keyId={theKey.keyId}
      key={`${name}_${theKey.keyId}`}
      {...theKey}
      materials={props.materials} // Pass materials down
      {...props}
    />
  )
}
RawKey.propTypes = {
  geometry: PropTypes.object.isRequired,
  theKey: PropTypes.object.isRequired,
  i: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  position: PropTypes.instanceOf(Vector3).isRequired,
  armLength: PropTypes.number.isRequired,
  materials: PropTypes.arrayOf(PropTypes.instanceOf(Material)).isRequired
}

const KeyGroup = ({ keys, name, position, materials, ...props }) => {
  const geometry = useKeyGeometry(props)

  return (
    <>
      {keys.map((theKey, i) => theKey &&
        <RawKey
          key={`${name}_${theKey.keyId}`}
          name={name}
          position={position}
          theKey={theKey}
          i={i}
          geometry={geometry}
          materials={materials} // Pass materials down
          {...props}
        />
      )}
    </>
  )
}

KeyGroup.propTypes = {
  keys: PropTypes.arrayOf(PropTypes.object).isRequired,
  name: PropTypes.string.isRequired,
  round: PropTypes.bool,
  position: PropTypes.instanceOf(Vector3).isRequired,
  armLength: PropTypes.number.isRequired,
  materials: PropTypes.arrayOf(PropTypes.instanceOf(Material)).isRequired
}

export default memo(KeyGroup)
