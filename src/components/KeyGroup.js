import React from 'react'
import PropTypes from 'prop-types'
import Key from './Key'
import { Vector3 } from 'three'

const RawKey = ({ name, position, theKey, i, ...props }) => {
  const getKey = (key, attribute) => {
    return key[attribute] ? key[attribute] : 0
  }
  const offsetX = getKey(theKey, 'ox')
  const offsetY = getKey(theKey, 'oy')
  const offsetZ = getKey(theKey, 'oz')
  return (
    <Key
      position={[position.x + i + offsetX, position.y + offsetY, position.z + offsetZ]}
      keyId={theKey.keyId}
      key={`${name}_${theKey.keyId}`}
      {...theKey}
      {...props}
    />
  )
}
RawKey.propTypes = {
  theKey: PropTypes.object.isRequired,
  i: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  position: PropTypes.instanceOf(Vector3).isRequired,
  armLength: PropTypes.number.isRequired
}

const KeyGroup = ({ keys, name, position, ...props }) => {
  return (
    <>
      {keys.map((theKey, i) => theKey &&
        RawKey({ name, position, theKey, i, ...props })
      )}
    </>
  )
}

KeyGroup.propTypes = {
  keys: PropTypes.arrayOf(PropTypes.object).isRequired,
  name: PropTypes.string.isRequired,
  position: PropTypes.instanceOf(Vector3).isRequired,
  armLength: PropTypes.number.isRequired
}

export default KeyGroup
