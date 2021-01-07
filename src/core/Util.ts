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

// @function falseFn(): Function
// Returns a function which always returns `false`.
export function falseFn(): false {
  return false;
}

// @function trim(str: String): String
// Compatibility polyfill for [String.prototype.trim](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/Trim)
export function trim(str: string): string {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

// @function splitWords(str: String): String[]
// Trims and splits the string on whitespace and returns the array of parts.
export function splitWords(str: string): string[] {
  return trim(str).split(/\s+/);
}

// @function extend(dest: Object, src?: Object): Object
// Merges the properties of the `src` object (or multiple objects) into `dest` object and returns the latter. Has an `L.extend` shortcut.
export function extend(
  dest: Record<string, unknown>,
  ...args: Array<Record<string, unknown>>
): Record<string, unknown> {
  let i, j, len, src;

  for (j = 0, len = args.length; j < len; j++) {
    src = args[j];
    for (i in src) {
      dest[i] = src[i];
    }
  }
  return dest;
}
// @property lastId: Number
// Last unique ID used by [`stamp()`](#util-stamp
export let lastId = 0;

// @function stamp(obj: Object): Number
// Returns the unique ID of an object, assigning it one if it doesn't have it.
export function stamp(obj: any): number {
  /*eslint-disable */
  obj._leaflet_id = obj._leaflet_id || ++lastId;
  return obj._leaflet_id;
  /* eslint-enable */
}
