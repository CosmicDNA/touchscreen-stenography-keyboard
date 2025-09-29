// import PropTypes from 'prop-types'
import React from 'react'
import useTheme from './hooks/useTheme'

const Floor = ({ ...props }) => {
  const theme = useTheme()
  // console.log(keyId)
  return (
      <mesh
        {...props}
        // eslint-disable-next-line react/no-unknown-property
        receiveShadow
        // eslint-disable-next-line react/no-unknown-property
        rotation-x={-Math.PI / 2}
        // eslint-disable-next-line react/no-unknown-property
        // position-y={-0.5}
      >
        {/* eslint-disable-next-line react/no-unknown-property */}
        <planeGeometry attach='geometry' args={[100, 100]} />
        <meshStandardMaterial
          // eslint-disable-next-line react/no-unknown-property
          attach='material'
          // eslint-disable-next-line react/no-unknown-property
          depthWrite={false}
          color={theme === 'dark' ? 'black' : 'white'}/>
      </mesh>
  )
}

Floor.propTypes = {
}

export default Floor
