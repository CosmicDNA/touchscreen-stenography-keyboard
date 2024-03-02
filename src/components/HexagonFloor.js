import PropTypes from 'prop-types'
import React from 'react'
import Hexagon from './Hexagon'

const sqrt3 = Math.sqrt(3)

const dimX = 7.5
const dimY = 3.5

const HexagonFloor = ({ size = 0.6, ...props }) => {
  const rowLength = Math.floor(dimX / size)
  const columnLength = Math.floor(dimY / size)

  return (
    <>
      {[...Array(columnLength).keys()].map(columnKey => {
        const j = columnKey % 2
        return [...Array(rowLength).keys()].map((key) => {
          const i = key % 2
          const name = `polygon_c${columnKey}r${key}`
          return <Hexagon {...props} radius={ size } key={key} name={name} position={[-5.2 + 1.5 * key * size, -2.3 + sqrt3 * columnKey * size + sqrt3 * i * size / 2, 0]} color={i && !j ? 'blue' : i && j ? 'gray' : !i && j ? 'white' : 'green'} />
        })
      })}
    </>
  )
}

HexagonFloor.propTypes = {
  size: PropTypes.number
}

export default HexagonFloor
