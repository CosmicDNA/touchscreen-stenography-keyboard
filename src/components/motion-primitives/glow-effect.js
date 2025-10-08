'use client'
import React from 'react'
import PropTypes from 'prop-types'
import { motion } from 'motion/react'

/**
 * @typedef {import('motion/react').Transition} Transition
 */

/**
 * @typedef {object} GlowEffectProps
 * @property {string} [className] - Additional classes for the component.
 * @property {React.CSSProperties} [style] - Custom inline styles.
 * @property {string[]} [colors] - Array of colors for the glow effect.
 * @property {'rotate'|'pulse'|'breathe'|'colorShift'|'flowHorizontal'|'static'} [mode] - The animation mode for the glow.
 * @property {number|'softest'|'soft'|'medium'|'strong'|'stronger'|'strongest'|'none'} [blur] - The blur level for the glow.
 * @property {Transition} [transition] - Custom transition settings from `motion/react`.
 * @property {number} [scale] - The scale of the glow effect.
 * @property {number} [duration] - The duration of the animation cycle.
 */

/** @param {GlowEffectProps} props */
export function GlowEffect ({
  className,
  style,
  colors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F'],
  mode = 'rotate',
  blur = 'medium',
  transition,
  scale = 1,
  duration = 5
}) {
  const BASE_TRANSITION = {
    repeat: Infinity,
    duration,
    ease: 'linear'
  }

  const animations = {
    rotate: {
      background: [
        `conic-gradient(from 0deg at 50% 50%, ${colors.join(', ')})`,
        `conic-gradient(from 360deg at 50% 50%, ${colors.join(', ')})`
      ],
      transition: {
        ...(transition ?? BASE_TRANSITION)
      }
    },
    pulse: {
      background: colors.map(
        (color) =>
          `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 100%)`
      ),
      scale: [1 * scale, 1.1 * scale, 1 * scale],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        ...(transition ?? {
          ...BASE_TRANSITION,
          repeatType: 'mirror'
        })
      }
    },
    breathe: {
      background: [
        ...colors.map(
          (color) =>
            `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 100%)`
        )
      ],
      scale: [1 * scale, 1.05 * scale, 1 * scale],
      transition: {
        ...(transition ?? {
          ...BASE_TRANSITION,
          repeatType: 'mirror'
        })
      }
    },
    colorShift: {
      background: colors.map((color, index) => {
        const nextColor = colors[(index + 1) % colors.length]
        return `conic-gradient(from 0deg at 50% 50%, ${color} 0%, ${nextColor} 50%, ${color} 100%)`
      }),
      transition: {
        ...(transition ?? {
          ...BASE_TRANSITION,
          repeatType: 'mirror'
        })
      }
    },
    flowHorizontal: {
      background: colors.map((color) => {
        const nextColor = colors[(colors.indexOf(color) + 1) % colors.length]
        return `linear-gradient(to right, ${color}, ${nextColor})`
      }),
      transition: {
        ...(transition ?? {
          ...BASE_TRANSITION,
          repeatType: 'mirror'
        })
      }
    },
    static: {
      background: `linear-gradient(to right, ${colors.join(', ')})`
    }
  }

  const getBlurValue = (blur) => {
    if (typeof blur === 'number') {
      return `${blur}px`
    }

    const presets = {
      softest: '1px',
      soft: '2px',
      medium: '4px',
      strong: '8px',
      stronger: '16px',
      strongest: '24px',
      none: '0px'
    }

    return presets[blur] || presets.medium
  }

  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        transform: `scale(${scale})`,
        filter: `blur(${getBlurValue(blur)})`,
        willChange: 'transform, filter',
        backfaceVisibility: 'hidden',
        ...style
      }}
      animate={animations[mode]}
      className={className}
    />
  )
}

GlowEffect.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  colors: PropTypes.arrayOf(PropTypes.string),
  mode: PropTypes.oneOf(['rotate', 'pulse', 'breathe', 'colorShift', 'flowHorizontal', 'static']),
  blur: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.oneOf(['softest', 'soft', 'medium', 'strong', 'stronger', 'strongest', 'none'])
  ]),
  transition: PropTypes.object,
  scale: PropTypes.number,
  duration: PropTypes.number
}
