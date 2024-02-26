import PropTypes from 'prop-types'
import React, { useRef } from 'react'
import * as THREE from 'three'
import { RenderTexture, Text } from '@react-three/drei'
import { suspend } from 'suspend-react'
import { useFrame } from '@react-three/fiber'
const inter = import('@pmndrs/assets/fonts/inter_regular.woff')

const Key = ({ roundResolution = 32, width = 8 / 10, lateral = 7 / 10, depth = 1 / 20, keyId, round, ...props }) => {
  const textRef = useRef()
  useFrame((state) => (textRef.current.position.x = Math.sin(state.clock.elapsedTime) * 2))
  const groupRef = useRef()
  const widthOnTwo = width / 2

  let pts
  if (round) {
    const radius = widthOnTwo
    const underSemiCircumference = [...Array(roundResolution / 2 + 1).keys()].map(i => {
      const a = Math.PI + 2 * Math.PI * i / roundResolution
      return [Math.cos(a) * radius, Math.sin(a) * radius]
    })

    const pre = [underSemiCircumference[0][0], underSemiCircumference[0][1] + lateral]
    const pos = [underSemiCircumference[underSemiCircumference.length - 1][0], underSemiCircumference[underSemiCircumference.length - 1][1] + lateral]

    pts = [pre, ...underSemiCircumference, pos]
  } else {
    pts = [[-widthOnTwo, 0], [-widthOnTwo, lateral], [widthOnTwo, lateral], [widthOnTwo, 0]]
  }

  const shapes = new THREE.Shape(pts.map(points => new THREE.Vector2(...points)))

  const extrudeSettings = {
    depth,
    steps: 1,
    bevelEnabled: true,
    bevelThickness: 8 / 200,
    bevelSize: 0.4 * 8 / 40,
    bevelSegments: 1
  }

  const onPointerDown = (event) => {
    console.log(`On pointer down event for key ${keyId}: `, event)
    groupRef.current.rotation.x = Math.PI / 32 * (4 / 10 + 7 / 10) / (lateral + widthOnTwo)
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
        position={[0, -lateral, 0]}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {/* eslint-disable-next-line react/no-unknown-property */}
        <meshLambertMaterial attach="material-0">
          <RenderTexture attach="map" anisotropy={16}>
            {/* eslint-disable-next-line react/no-unknown-property */}
            <color attach="background" args={[THREE.Color.NAMES.antiquewhite]} />
            <Text font={suspend(inter).default} ref={textRef} fontSize={1} color="#555" position={[0, 0, 0]}>
              {`Hello, my keyId is ${keyId}!`}
            </Text>
          </RenderTexture>
        </meshLambertMaterial>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <meshLambertMaterial attach="material-1" args={[{ color: THREE.Color.NAMES.gray, wireframe: false }]}/>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <extrudeGeometry args={[shapes, extrudeSettings]} />
      </mesh>
    </group>
  )
}

Key.propTypes = {
  depth: PropTypes.number,
  keyId: PropTypes.string,
  lateral: PropTypes.number,
  round: PropTypes.bool,
  roundResolution: PropTypes.number,
  width: PropTypes.number
}

export default Key
