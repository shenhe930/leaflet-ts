import { formatNum, isArray } from '@/core/Util';

const trunc =
  Math.trunc ||
  function (v: number) {
    return v > 0 ? Math.floor(v) : Math.ceil(v);
  };

/**
 * @class Point
 * @aka L.Point
 *
 * Represents a point with `x` and `y` coordinates in pixels.
 *
 * @example
 *
 * ```js
 * var point = L.point(200, 300);
 * ```
 *
 * All Leaflet methods and options that accept `Point` objects also accept them in a simple Array form (unless noted otherwise), so these lines are equivalent:
 *
 * ```js
 * map.panBy([200, 300]);
 * map.panBy(L.point(200, 300));
 * ```
 *
 * Note that `Point` does not inherit from Leaflet's `Class` object,
 * which means new classes can't inherit from it, and new methods
 * can't be added to it with the `include` function.
 */

export class Point {
  public x: number;
  public y: number;
  constructor(x: number, y: number, round = false) {
    this.x = round ? Math.round(x) : x;
    this.y = round ? Math.round(y) : y;
  }

  public clone(): Point {
    return new Point(this.x, this.y);
  }

  public add(point: Point): Point {
    return this.clone()._add(point);
  }

  public _add(point: Point): Point {
    this.x += point.x;
    this.y += point.y;
    return this;
  }

  // @method subtract(otherPoint: Point): Point
  // Returns the result of subtraction of the given point from the current.
  public subtract(point: Point): Point {
    return this.clone()._subtract(toPoint(point));
  }

  public _subtract(point: Point): Point {
    this.x -= point.x;
    this.y -= point.y;
    return this;
  }

  // @method divideBy(num: Number): Point
  // Returns the result of division of the current point by the given number.
  public divideBy(num: number): Point {
    return this.clone()._divideBy(num);
  }

  public _divideBy(num: number): Point {
    this.x /= num;
    this.y /= num;
    return this;
  }

  // @method multiplyBy(num: Number): Point
  // Returns the result of multiplication of the current point by the given number.
  public multiplyBy(num: number): Point {
    return this.clone()._multiplyBy(num);
  }

  public _multiplyBy(num: number): Point {
    this.x *= num;
    this.y *= num;
    return this;
  }

  // @method scaleBy(scale: Point): Point
  // Multiply each coordinate of the current point by each coordinate of
  // `scale`. In linear algebra terms, multiply the point by the
  // [scaling matrix](https://en.wikipedia.org/wiki/Scaling_%28geometry%29#Matrix_representation)
  // defined by `scale`.
  public scaleBy(point: Point): Point {
    return new Point(this.x * point.x, this.y * point.y);
  }

  // @method unscaleBy(scale: Point): Point
  // Inverse of `scaleBy`. Divide each coordinate of the current point by
  // each coordinate of `scale`.
  public unscaleBy(point: Point): Point {
    return new Point(this.x / point.x, this.y / point.y);
  }

  // @method round(): Point
  // Returns a copy of the current point with rounded coordinates.
  public round(): Point {
    return this.clone()._round();
  }

  public _round(): Point {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }

  // @method floor(): Point
  // Returns a copy of the current point with floored coordinates (rounded down).
  public floor(): Point {
    return this.clone()._floor();
  }

  public _floor(): Point {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  }

  // @method ceil(): Point
  // Returns a copy of the current point with ceiled coordinates (rounded up).
  public ceil(): Point {
    return this.clone()._ceil();
  }

  public _ceil(): Point {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
  }

  // @method trunc(): Point
  // Returns a copy of the current point with truncated coordinates (rounded towards zero).
  public trunc(): Point {
    return this.clone()._trunc();
  }

  public _trunc(): Point {
    this.x = trunc(this.x);
    this.y = trunc(this.y);
    return this;
  }

  // @method distanceTo(otherPoint: Point): Number
  // Returns the cartesian distance between the current and the given points.
  public distanceTo(point: Point): number {
    point = toPoint(point);

    const x = point.x - this.x;
    const y = point.y - this.y;

    return Math.sqrt(x * x + y * y);
  }

  // @method equals(otherPoint: Point): Boolean
  // Returns `true` if the given point has the same coordinates.
  public equals(point: Point): boolean {
    point = toPoint(point);

    return point.x === this.x && point.y === this.y;
  }

  // @method contains(otherPoint: Point): Boolean
  // Returns `true` if both coordinates of the given point are less than the corresponding current point coordinates (in absolute values).
  public contains(point: Point): boolean {
    point = toPoint(point);

    return (
      Math.abs(point.x) <= Math.abs(this.x) &&
      Math.abs(point.y) <= Math.abs(this.y)
    );
  }

  // @method toString(): String
  // Returns a string representation of the point for debugging purposes.
  public toString(): string {
    return 'Point(' + formatNum(this.x) + ', ' + formatNum(this.y) + ')';
  }
}

export type PointLike = Point | [number, number] | { x: number; y: number };

// @factory L.point(x: Number, y: Number, round?: Boolean)
// Creates a Point object with the given `x` and `y` coordinates. If optional `round` is set to true, rounds the `x` and `y` values.

// @alternative
// @factory L.point(coords: Number[])
// Expects an array of the form `[x, y]` instead.

// @alternative
// @factory L.point(coords: Object)
// Expects a plain object of the form `{x: Number, y: Number}` instead.
export function toPoint(x: PointLike, y = 0, round = false): Point {
  if (x instanceof Point) {
    return x;
  }
  if (isArray(x)) {
    return new Point(x[0], x[1]);
  }
  if (x === undefined || x === null) {
    return x;
  }
  if (typeof x === 'object' && 'x' in x && 'y' in x) {
    return new Point(x.x, x.y);
  }

  return new Point(x, y, round);
}
