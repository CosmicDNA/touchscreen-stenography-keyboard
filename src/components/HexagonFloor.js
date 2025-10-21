import PropTypes from 'prop-types'
// import React, { useMemo } from 'react'
import React, { useState, useRef } from 'react'
// import Hexagon from './Hexagon'
import { getCircularPoints, eqSet } from './utils/tools'
import { Vector2, Raycaster } from 'three'
import useMultiTouchDrag from './hooks/use-multi-touch-drag'
import { useTunnelContext } from './hooks/useTunnel'
import { useThree } from '@react-three/fiber'

// const sqrt3 = Math.sqrt(3)

// const dimX = 7.5
// const dimY = 3.5

const keyId = 'floor'
const fingerResolution = 5

const HexagonFloor = ({ size = 0.6, pressedKeys, updatePressedKeys, ...props }) => {
  const [message, setMessage] = useState('')
  const groupRef = useRef()
  const { camera, size: canvasSize } = useThree()

  const rawFingerModel = getCircularPoints(
    fingerResolution,
    fingerResolution,
    0.05
  )

  // const rowLength = Math.floor(dimX / size)
  // const columnLength = Math.floor(dimY / size)

  // const geometry = useMemo(() => {
  //   const underSemiCircumference = getCircularPoints(
  //     6,
  //     6,
  //     size,
  //     Math.PI
  //   )
  //   const coordinatesList = underSemiCircumference
  //     .map(n => new Vector3(n[0], n[1], 0))

  //   const shape = new Shape(coordinatesList)
  //   return new ShapeGeometry(shape)
  // }, [size])

  const setMyPressedKeys = (newSet) => updatePressedKeys((map) => map.set(keyId, newSet))
  const clearMyPressedKeys = () => updatePressedKeys((map) => map.delete(keyId))

  useMultiTouchDrag((ev) => {
    if (ev.pointers.length > 0) {
      const allIntersectedKeys = new Set()

      // Retrieve all key meshes once
      const keyMeshes = groupRef.current?.parent?.children
        .filter(c => c.name === 'key group')
        .map(g => g.children[0]) // select first group
        .map(g => g.children[0]) // select first mesh

      if (!keyMeshes) return

      for (const pointer of ev.pointers) {
        const { clientX, clientY } = pointer
        const coords = new Vector2(
          (clientX / canvasSize.width) * 2 - 1,
          -(clientY / canvasSize.height) * 2 + 1
        )
        const fingerVectors = rawFingerModel.map(v => new Vector2(...v).add(coords))

        const intersects = new Set([...fingerVectors.flatMap(v => {
          const raycaster = new Raycaster()
          raycaster.far = 50
          raycaster.setFromCamera(v, camera)
          return raycaster.intersectObjects(keyMeshes)
        }).map(o => o.object.userData.keyId)])

        for (const key of intersects) {
          allIntersectedKeys.add(key)
        }
      }

      const previousSet = pressedKeys?.get(keyId)
      if (!eqSet(previousSet, allIntersectedKeys)) {
        setMyPressedKeys(allIntersectedKeys)
      }
    } else {
      // No more pointers, clear the pressed keys for the floor
      clearMyPressedKeys()
    }

    setMessage(prev => prev + `\n[${ev.type}] Active pointers: ${ev.pointers.length}`)
  })

  const { status } = useTunnelContext()

  return (
    <group
      ref={groupRef}
      {...props}
    >
      {/* To render newlines, we wrap the text in an element with the `white-space: pre-wrap` style. */}
      {<status.In >
        <div style={{ whiteSpace: 'pre-wrap', color: 'white', position: 'absolute', top: 10, left: 10 }}>
          {message}
        </div>
      </status.In>}
      {/* {[...Array(columnLength).keys()].map(columnKey => {
        const j = columnKey % 2
        return [...Array(rowLength).keys()].map((key) => {
          const i = key % 2
          const name = `polygon_c${columnKey}r${key}`
          return <Hexagon
            {...props}
            geometry={geometry}
            key={key}
            name={name}
            position={[-5.2 + 1.5 * key * size, -2.3 + sqrt3 * columnKey * size + sqrt3 * i * size / 2, 0]}
            color={i && !j ? 'blue' : i && j ? 'gray' : !i && j ? 'white' : 'green'}
          />
        })
      })} */}
    </group>
  )
}

HexagonFloor.propTypes = {
  size: PropTypes.number,
  pressedKeys: PropTypes.instanceOf(Map),
  updatePressedKeys: PropTypes.func
}

export default HexagonFloor
