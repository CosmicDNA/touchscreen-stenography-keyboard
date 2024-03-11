/**
 *
 * @param {Number} segments
 * @param {Number} resolution
 * @param {Number} radius
 * @param {Number} theta0
 * @returns {Number[]}
 */
const getCircularPoints = (segments, resolution, radius, theta0 = 0) => {
  return [...Array(segments).keys()].map(i => {
    const theta = theta0 + 2 * Math.PI * i / resolution
    return [Math.cos(theta) * radius, Math.sin(theta) * radius]
  })
}

/**
 *
 * @param {Set} xs
 * @param {Set} ys
 * @returns {Boolean}
 */
const eqSet = (xs, ys) =>
  xs?.size === ys?.size &&
  [...xs].every((x) => ys.has(x))

/**
 *
 * @param {any[]} xs
 * @param {any[]} ys
 * @returns {Boolean}
 */
const eqArr = (xs, ys) =>
  xs?.length === ys?.length &&
  xs.every((x) => ys.includes(x))

/**
 *
 * @param {Set} a
 * @param {Set} b
 * @returns {Set}
 */
const getUniqueItems = (a, b) => new Set([...a].filter(item => !b.has(item)))

/**
 *
 * @param {Set} a
 * @param {Set} b
 * @returns {[Set, Set]}
 */
const getAddedAndRemovedItems = (a, b) => {
  return [
    [a, b],
    [b, a]
  ].map((arr) => getUniqueItems(...arr))
}

/**
 *
 * @param {Set} set
 */
const dep = (set) => {
  return JSON.stringify([...set].sort())
}

const editedObject = (object, selector) =>
  Object.fromEntries(
    Object.entries(object).map(selector)
  )

export {
  dep,
  eqSet,
  eqArr,
  editedObject,
  getUniqueItems,
  getAddedAndRemovedItems,
  getCircularPoints
}
