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
 * @param {Set} theSet
 * @returns {any[]}
 */
const uniqueArray = (theSet) => {
  return [...theSet].sort((a, b) => a - b)
}

/**
 *
 * @param {Set} theSet
 * @returns {String}
 */
const uniqueString = (theSet) => {
  return JSON.stringify(uniqueArray(theSet))
}

/**
 *
 * @param {Set} a
 * @param {Set} b
 * @returns {any[]}
 */
const getUniqueItems = (a, b) => [...a].filter(item => !b.has(item))

/**
 *
 * @param {Set} a
 * @param {Set} b
 * @returns {any[]}
 */
const getSortedUniqueItems = (a, b) => getUniqueItems(a, b).sort((a, b) => a - b)

/**
 *
 * @param {Set} a
 * @param {Set} b
 * @returns {[any[], any[]]}
 */
const getAddedAndRemovedItems = (a, b) => {
  return [
    [a, b],
    [b, a]
  ].map((arr) => getSortedUniqueItems(...arr))
}

export {
  eqSet,
  eqArr,
  uniqueString,
  uniqueArray,
  getUniqueItems,
  getSortedUniqueItems,
  getAddedAndRemovedItems,
  getCircularPoints
}
