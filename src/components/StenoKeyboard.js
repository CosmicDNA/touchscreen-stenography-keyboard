import React from 'react'
import KeyGroup from './KeyGroup'
import Key from './Key'

const StenoKeyboard = (props) => {
  const enter = 0.2
  const p = 1.3
  return (
    <group {...props}>
      <Key keyId={'#'} width={9.8} position={[-0.5, 4.8, 0]}/>
      <Key keyId={'*'} round={true} lateral={2} position={[-1, 3 * p, 0]}/>
      <Key keyId={'S-'} round={true} lateral={2} position={[-5, 3 * p, 0]}/>
      <KeyGroup keys={['-F', '-P', '-L', '-T', '-D']} name={'a'} position={[0, 3 * p, 0]} lateral={1.1}/>
      <KeyGroup keys={['-R', '-G', '-B', '-S', '-Z']} name={'b'} position={[0, 2 * p, 0]} round={true}/>
      <KeyGroup keys={['A', 'O']} name={'c'} position={[0 - enter, p, 0]} round={true}/>
      <KeyGroup keys={['E', 'U']} name={'d'} position={[-3 + enter, p, 0]} round={true}/>
      <KeyGroup keys={['T-', 'P-', 'H-']} name={'e'} position={[-4, 3 * p, 0]} lateral={1.1}/>
      <KeyGroup keys={['K-', 'W-', 'R-']} name={'f'} position={[-4, 2 * p, 0]} round={true}/>
    </group>
  )
}

export default StenoKeyboard
