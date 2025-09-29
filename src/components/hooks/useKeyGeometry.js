import { useMemo } from 'react'
import { Shape, Vector2, ExtrudeGeometry } from 'three'
import { getCircularPoints } from '../utils/tools'

const useKeyGeometry = ({
  width = 7 / 10,
  lateral = 7 / 10,
  depth = 1 / 20,
  round = false,
  grow = false,
  roundResolution = 32
}) => {
  const widthOnTwo = width / 2

  const geometry = useMemo(() => {
    let addLeft, addRight
    switch (grow) {
      case 'left':
        addLeft = 0.1
        addRight = 0
        break
      case 'right':
        addLeft = 0
        addRight = 0.1
        break
      default:
        addLeft = 0
        addRight = 0
        break
    }

    let pts
    if (round) {
      const radius = widthOnTwo
      const underSemiCircumference = getCircularPoints(
        roundResolution / 2 + 1,
        roundResolution,
        radius,
        Math.PI
      )

      const pre = [
        [underSemiCircumference[0][0] - addLeft, underSemiCircumference[0][1] + lateral],
        [underSemiCircumference[0][0] - addLeft, underSemiCircumference[0][1]]
      ]
      const pos = [
        [underSemiCircumference[underSemiCircumference.length - 1][0] + addRight, underSemiCircumference[underSemiCircumference.length - 1][1]],
        [underSemiCircumference[underSemiCircumference.length - 1][0] + addRight, underSemiCircumference[underSemiCircumference.length - 1][1] + lateral]
      ]

      pts = [...pre, ...underSemiCircumference, ...pos]
    } else {
      pts = [[-widthOnTwo - addLeft, 0], [-widthOnTwo - addLeft, lateral], [widthOnTwo + addRight, lateral], [widthOnTwo + addRight, 0]]
    }

    const extrudeSettings = {
      depth,
      steps: 1,
      bevelEnabled: true,
      bevelThickness: 8 / 200,
      bevelSize: 0.4 * 8 / 40,
      bevelSegments: 1
    }

    const shape = new Shape(pts.map(points => new Vector2(...points)))
    const geometry = new ExtrudeGeometry(shape, extrudeSettings)
    return geometry
  }, [depth, grow, lateral, round, roundResolution, widthOnTwo])

  return geometry
}

export default useKeyGeometry
