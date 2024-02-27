import React from 'react'
import PropTypes from 'prop-types'
import Key from './Key'

const KeyGroup = ({ keys, name, position, round, ...props }) => {
  return (
    <>
      {[...Array(keys.length).keys()].map(i =>
        <Key position={[position.x + i, position.y, position.z]} keyId={keys[i]} key={`${name}_${keys[i]}`} round={round} {...props}/>
      )}
    </>
  )
}

KeyGroup.propTypes = {
  keys: PropTypes.arrayOf(PropTypes.string),
  name: PropTypes.string,
  position: PropTypes.object,
  round: PropTypes.bool
}

export default KeyGroup
