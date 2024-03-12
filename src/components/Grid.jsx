import PropTypes from 'prop-types'
import { Instances, Instance } from '@react-three/drei'

const Grid = ({ number = 23, lineWidth = 0.026, height = 0.5, ...props }) => (
  // Renders a grid and crosses as instances
  <Instances {...props} >
    {/* eslint-disable-next-line react/no-unknown-property */}
    <planeGeometry args={[lineWidth, height]} />
    <meshBasicMaterial color="#999" />
    {Array.from({ length: number }, (_, y) =>
      Array.from({ length: number }, (_, x) => (
        // eslint-disable-next-line react/no-unknown-property
        <group key={x + ':' + y} position={[x * 2 - Math.floor(number / 2) * 2, -0.01, y * 2 - Math.floor(number / 2) * 2]}>
          <Instance rotation={[-Math.PI / 2, 0, 0]} />
          <Instance rotation={[-Math.PI / 2, 0, Math.PI / 2]} />
        </group>
      ))
    )}
    {/* eslint-disable-next-line react/no-unknown-property */}
    <gridHelper args={[100, 100, '#bbb', '#bbb']} position={[0, -0.01, 0]} />
  </Instances>
)

Grid.propTypes = {
  height: PropTypes.number,
  lineWidth: PropTypes.number,
  number: PropTypes.number
}

export default Grid
