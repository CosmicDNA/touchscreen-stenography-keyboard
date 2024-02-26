import Key from "./Key"

const KeyGroup = ({keys, name, position, round, ...props}) => {
  const x = position[0]
  const y = position[1]
  const z = position[2]
  return(
    <>
      {[...Array(keys.length).keys()].map(i =>
        <Key position={[x+i, y, z]} keyId={keys[i]} key={`${name}_${keys[i]}`} round={round} {...props}/>
      )}
    </>
  )
}

export default KeyGroup