const LookupStateEnum = Object.freeze({
  IDLE: 0,
  LOOKING_UP: 1,
  LOOKUP_READY: 2,
  LOOKUP_ERROR: 3
})

const convertLookupStrokeToKeysSequence = (lookupStroke) => {
  // Define the key banks in their standard order.
  const stenoBanks = {
    left: 'STKPWHR',
    vowels: 'AO*EU',
    right: 'FRPBLGTSDZ'
  }

  /**
   *
   * @param {String[]} stroke
   * @returns
   */
  const parseStroke = (stroke) => {
    let left = ''
    let vowels = ''
    let right = ''

    if (stroke.includes('-')) {
      const parts = stroke.split('-')
      const midIndex = stenoBanks.vowels.split('').findIndex(v => parts.includes(v))

      if (midIndex > -1) { // Contains vowels
        const vowelPartIndex = parts.findIndex(p => stenoBanks.vowels.includes(p))
        left = parts.slice(0, vowelPartIndex).join('')
        vowels = parts[vowelPartIndex]
        right = parts.slice(vowelPartIndex + 1).join('')
      } else { // No vowels, hyphen is a separator
        left = parts[0]
        right = parts.slice(1).join('')
      }
    } else {
      // No hyphen, so we need to find the boundary between left/vowels and right
      let vowelIndex = -1
      for (let i = 0; i < stroke.length; i++) {
        if (stenoBanks.vowels.includes(stroke[i])) {
          vowelIndex = i
          break
        }
      }

      if (vowelIndex > -1) {
        left = stroke.substring(0, vowelIndex)
        const remaining = stroke.substring(vowelIndex)
        vowels = remaining.split('').filter(c => stenoBanks.vowels.includes(c)).join('')
        right = remaining.split('').filter(c => stenoBanks.right.includes(c)).join('')
      } else {
        left = stroke
      }
    }

    const leftKeys = left.split('').map(c => `${c}-`)
    const vowelKeys = vowels.split('').map(c => c === '*' ? '*' : (c === 'A' || c === 'O' ? `${c}-` : `-${c}`))
    const rightKeys = right.split('').map(c => `-${c}`)
    return [...leftKeys, ...vowelKeys, ...rightKeys]
  }
  return lookupStroke.flat().map(parseStroke)
}

export {
  LookupStateEnum,
  convertLookupStrokeToKeysSequence
}
