import PropTypes from 'prop-types'
import React, { useState, useRef } from 'react'
import * as THREE from 'three'
import { useDrag } from '@use-gesture/react'
// import { CycleRaycast } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
// import { useCycleRaycastContext } from '../hooks/useCycleRaycast'

// import { useCycleRaycastContext } from '../hooks/useCycleRaycast'

// const { setCycleRayCastState, CycleRaycast } = useCycleRaycastContext()
// <CycleRaycast onChanged={setCycleRayCastState} />

const Key = ({ roundResolution = 32, width = 8 / 10, lateral = 7 / 10, depth = 1 / 20, keyId, round, ...props }) => {
  const meshRef = useRef()
  const [pressed, setPressed] = useState(false)
  // const [cycleRayCastState, setCycleRayCastState] = useState({
  //   objects: [],
  //   cycle: 0
  // })
  const { raycaster, camera } = useThree()
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
    setPressed(true)
  }
  const onPointerUp = (event) => {
    console.log(`On pointer up event for key ${keyId}: `, event)
    setPressed(false)
  }

  const bind = useDrag(({ event, down }) => {
    // const { down } = event
    const { clientX, clientY } = event
    if (down && pressed) {
      // Assuming you have clientX and clientY from the event
      const coords = new THREE.Vector2()
      coords.x = (clientX / window.innerWidth) * 2 - 1
      coords.y = -(clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(coords, camera)
      const intersects = raycaster.intersectObject(meshRef.current)
      // console.log(intersects)
      // If the pressed key is no longer found in list of pierced through objects, release it.
      if (!intersects.find(obj => obj?.object?.uuid === meshRef.current.uuid)) {
        console.log(intersects)
        onPointerUp()
      }
    }
  })

  return (
    <group
      {...bind()}
      {...props}
      // eslint-disable-next-line react/no-unknown-property
      rotation-x={pressed ? Math.PI / 32 * (4 / 10 + 7 / 10) / (lateral + widthOnTwo) : 0}
      // eslint-disable-next-line react/no-unknown-property
      position-z={pressed ? -0.1 : 0}
       >
        <mesh
          ref={meshRef}
          // eslint-disable-next-line react/no-unknown-property
          position-y={-lateral}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          {[THREE.Color.NAMES.antiquewhite, THREE.Color.NAMES.gray].map((color, i) =>
            // eslint-disable-next-line react/no-unknown-property
            <meshLambertMaterial key={i} attach={`material-${i}`} args={[{ color, wireframe: false }]} />
          )}
          {/* eslint-disable-next-line react/no-unknown-property */}
          <extrudeGeometry args={[new THREE.Shape(pts.map(points => new THREE.Vector2(...points))), extrudeSettings]} />
        </mesh>
        {/* <CycleRaycast onChanged={setCycleRayCastState} /> */}
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
