import PropTypes from 'prop-types'
import React from 'react'
import { GlowEffect } from './motion-primitives/glow-effect.js'

const ColoredCircle = ({ color, size = 10, strokeWidth = 0.5, marginLeft = 8, marginTop = 8, glow = false, tooltip }) => {
  const sizeOn2 = size / 2
  // Subtract half the stroke's width to keep the entire circle inside the SVG bounds
  const radius = sizeOn2 - (strokeWidth / 2)

  return color
    ? (
    <div
      title={tooltip}
      style={{
        position: 'relative',
        display: 'inline-flex',
        verticalAlign: 'middle',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft,
        marginTop,
        width: size,
        height: size
      }}
    >
      {glow && (
        <GlowEffect
          colors={[color]}
          blur='soft'
          mode='pulse'
          scale={2}
          duration={0.5}
        />
      )}
      <svg
        style={{
          position: 'relative', // Ensure SVG is rendered on top of the glow
          zIndex: 1,
          color
        }}
        width={size}
        height={size}
      >
        <circle cx={sizeOn2} cy={sizeOn2} r={radius} fill="currentColor" stroke="black" strokeWidth={strokeWidth} />
      </svg>
    </div>
      )
    : null
}

ColoredCircle.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
  marginLeft: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  marginTop: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  glow: PropTypes.bool,
  tooltip: PropTypes.string
}

export default ColoredCircle
