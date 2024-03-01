const eqSet = (xs, ys) =>
  xs?.size === ys?.size &&
  [...xs].every((x) => ys.has(x))

export { eqSet }
