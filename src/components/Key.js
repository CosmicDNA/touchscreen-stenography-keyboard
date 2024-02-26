import PropTypes from 'prop-types'
import React, { useRef } from 'react'
import * as THREE from 'three'

const Key = ({ roundResolution = 32, width = 8 / 10, lateral = 7 / 10, depth = 1 / 20, keyId, round, ...props }) => {
  const groupRef = useRef()
  const radius = width / 2

  let pts
  if (round) {
    const underSemiCircumference = [...Array(roundResolution / 2 + 1).keys()].map(i => {
      const a = Math.PI + 2 * Math.PI * i / roundResolution
      return [Math.cos(a) * radius, Math.sin(a) * radius]
    })

    const pre = [underSemiCircumference[0][0], underSemiCircumference[0][1] + lateral]
    const pos = [underSemiCircumference[underSemiCircumference.length - 1][0], underSemiCircumference[underSemiCircumference.length - 1][1] + lateral]

    pts = [pre, ...underSemiCircumference, pos]
  } else {
    pts = [[-radius, 0], [-radius, lateral], [radius, lateral], [radius, 0]]
  }

  const shape = new THREE.Shape(pts.map(points => new THREE.Vector2(...points)))

  const extrudeSettings = {
    depth,
    steps: 1,
    bevelEnabled: true,
    bevelThickness: 8 / 200,
    bevelSize: 0.4 * 8 / 40,
    bevelSegments: 1
  }

  const material1 = new THREE.MeshLambertMaterial({ color: THREE.Color.NAMES.antiquewhite, wireframe: false })
  const material2 = new THREE.MeshLambertMaterial({ color: THREE.Color.NAMES.gray, wireframe: false })
  const materials = [material1, material2]

  const onPointerDown = (event) => {
    console.log(`On pointer down event for key ${keyId}: `, event)
    groupRef.current.rotation.x = Math.PI / 32 * (4 / 10 + 7 / 10) / (lateral + radius)
    groupRef.current.position.z = -0.1
  }
  const onPointerUp = (event) => {
    console.log(`On pointer up event for key ${keyId}: `, event)
    groupRef.current.rotation.x = 0
    groupRef.current.position.z = 0
  }

  return (
    <group
      {...props}
      ref={groupRef} >
      <mesh
        // eslint-disable-next-line react/no-unknown-property
        material={materials}
        // eslint-disable-next-line react/no-unknown-property
        position={[0, -lateral, 0]}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {/* eslint-disable-next-line react/no-unknown-property */}
        <extrudeGeometry args={[shape, extrudeSettings]}/>
      </mesh>
    </group>
  )
}

Key.propTypes = {
  depth: PropTypes.any,
  keyId: PropTypes.any,
  lateral: PropTypes.any,
  round: PropTypes.any,
  roundResolution: PropTypes.number,
  width: PropTypes.number
}

export default Key
