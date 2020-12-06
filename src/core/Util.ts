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
