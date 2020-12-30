// @function isArray(obj): Boolean
// Compatibility polyfill for [Array.isArray](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)
export const isArray =
  Array.isArray ||
  function (obj: Array<unknown>) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

// @function formatNum(num: Number, digits?: Number): Number
// Returns the number `num` rounded to `digits` decimals, or to 6 decimals by default.
export function formatNum(num: number, digits = 6): number {
  const pow = Math.pow(10, digits);
  return Math.round(num * pow) / pow;
}

// @function wrapNum(num: Number, range: Number[], includeMax?: Boolean): Number
// Returns the number `num` modulo `range` in such a way so it lies within
// `range[0]` and `range[1]`. The returned value will be always smaller than
// `range[1]` unless `includeMax` is set to `true`.
export function wrapNum(
  x: number,
  range: number[],
  includeMax?: boolean,
): number {
  const max = range[1];
  const min = range[0];
  const d = max - min;
  return x === max && includeMax ? x : ((((x - min) % d) + d) % d) + min;
}
