import PropTypes from 'prop-types'
import React from 'react'

const ColoredCircle = ({ color, size = 10, strokeWidth = 0.5, marginLeft = 5, marginTop = 5 }) => {
  const sizeOn2 = size / 2
  // Subtract half the stroke's width to keep the entire circle inside the SVG bounds
  const radius = sizeOn2 - (strokeWidth / 2)

  return color
    ? (
    <svg
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        color,
        marginLeft,
        marginTop
      }}
      width={size}
      height={size}
    >
      <circle cx={sizeOn2} cy={sizeOn2} r={radius} fill="currentColor" stroke="black" strokeWidth={strokeWidth} />
    </svg>
      )
    : null
}

ColoredCircle.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
  marginLeft: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  marginTop: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

export default ColoredCircle
