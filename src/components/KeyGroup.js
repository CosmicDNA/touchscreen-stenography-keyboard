import React from 'react'
import PropTypes from 'prop-types'
import Key from './Key'

const KeyGroup = ({ keys, name, position, round, ...props }) => {
  const x = position[0]
  const y = position[1]
  const z = position[2]
  return (
    <>
      {[...Array(keys.length).keys()].map(i =>
        <Key position={[x + i, y, z]} keyId={keys[i]} key={`${name}_${keys[i]}`} round={round} {...props}/>
      )}
    </>
  )
}

KeyGroup.propTypes = {
  keys: PropTypes.shape({
    length: PropTypes.any
  }),
  name: PropTypes.any,
  position: PropTypes.any,
  round: PropTypes.any
}

export default KeyGroup
