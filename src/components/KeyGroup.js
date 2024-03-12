import React from 'react'
import PropTypes from 'prop-types'
import Key from './Key'
import { Vector3 } from 'three'

const KeyGroup = ({ keys, name, position, ...props }) => {
  return (
    <>
      {keys.map((theKey, i) =>
        <Key
          position={[position.x + i, position.y, position.z]}
          keyId={theKey.keyId}
          key={`${name}_${theKey.keyId}`}
          {...theKey}
          {...props}/>
      )}
    </>
  )
}

KeyGroup.propTypes = {
  keys: PropTypes.arrayOf(PropTypes.object).isRequired,
  name: PropTypes.string.isRequired,
  position: PropTypes.instanceOf(Vector3).isRequired,
  round: PropTypes.bool,
  pressedKeys: PropTypes.objectOf(Map).isRequired,
  setPressedKeys: PropTypes.func.isRequired,
  onKeyPress: PropTypes.func.isRequired,
  onKeyRelease: PropTypes.func.isRequired,
  allKeys: PropTypes.objectOf(Set).isRequired
}

export default KeyGroup
