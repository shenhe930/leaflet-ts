import { Point } from './Point';

export class Transformation {
  private _a: number;
  private _b: number;
  private _c: number;
  private _d: number;
  constructor(a: number, b: number, c: number, d: number) {
    this._a = a;
    this._b = b;
    this._c = c;
    this._d = d;
  }

  // @method transform(point: Point, scale?: Number): Point
  // Returns a transformed point, optionally multiplied by the given scale.
  // Only accepts actual `L.Point` instances, not arrays.
  public transform(point: Point, scale = 1): Point {
    return this._transform(point.clone(), scale);
  }

  // destructive transform (faster)
  public _transform(point: Point, scale = 1): Point {
    point.x = scale * (this._a * point.x + this._b);
    point.y = scale * (this._c * point.y + this._d);
    return point;
  }

  // @method untransform(point: Point, scale?: Number): Point
  // Returns the reverse transformation of the given point, optionally divided
  // by the given scale. Only accepts actual `L.Point` instances, not arrays.
  public untransform(point: Point, scale = 1): Point {
    return new Point(
      (point.x / scale - this._b) / this._a,
      (point.y / scale - this._d) / this._c,
    );
  }
}

// factory L.transformation(a: Number, b: Number, c: Number, d: Number)

// @factory L.transformation(a: Number, b: Number, c: Number, d: Number)
// Instantiates a Transformation object with the given coefficients.

// @alternative
// @factory L.transformation(coefficients: Array): Transformation
// Expects an coefficients array of the form
// `[a: Number, b: Number, c: Number, d: Number]`.

export function toTransformation(
  a: number,
  b: number,
  c: number,
  d: number,
): Transformation {
  return new Transformation(a, b, c, d);
}
