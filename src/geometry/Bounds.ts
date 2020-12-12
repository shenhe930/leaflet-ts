import { Point, PointLike, toPoint } from './Point';

export class Bounds {
  public min!: Point;
  public max!: Point;
  constructor(a: PointLike | Array<PointLike>, b?: PointLike) {
    if (!a) {
      return;
    }

    const points: Array<PointLike> = b
      ? [a as PointLike, b]
      : (a as Array<PointLike>);

    for (let i = 0, len = points.length; i < len; i++) {
      this.extend(points[i]);
    }
  }

  // @method extend(point: Point): this
  // Extends the bounds to contain the given point.
  public extend(point: PointLike): Bounds {
    // (Point)
    const p = toPoint(point);

    // @property min: Point
    // The top left corner of the rectangle.
    // @property max: Point
    // The bottom right corner of the rectangle.
    if (!this.min || !this.max) {
      this.min = p.clone();
      this.max = p.clone();
      return this;
    }

    this.min.x = Math.min(p.x, this.min.x);
    this.max.x = Math.max(p.x, this.max.x);
    this.min.y = Math.min(p.y, this.min.y);
    this.max.y = Math.max(p.y, this.max.y);

    return this;
  }

  // @method getCenter(round?: Boolean): Point
  // Returns the center point of the bounds.
  public getCenter(round?: boolean): Point {
    return new Point(
      (this.min.x + this.max.x) / 2,
      (this.min.y + this.max.y) / 2,
      round,
    );
  }

  // @method getBottomLeft(): Point
  // Returns the bottom-left point of the bounds.
  public getBottomLeft(): Point {
    return new Point(this.min.x, this.max.y);
  }

  // @method getTopRight(): Point
  // Returns the top-right point of the bounds.
  public getTopRight(): Point {
    // -> Point
    return new Point(this.max.x, this.min.y);
  }

  // @method getTopLeft(): Point
  // Returns the top-left point of the bounds (i.e. [`this.min`](#bounds-min)).
  public getTopLeft(): Point {
    return this.min; // left, top
  }

  // @method getBottomRight(): Point
  // Returns the bottom-right point of the bounds (i.e. [`this.max`](#bounds-max)).
  public getBottomRight(): Point {
    return this.max; // right, bottom
  }

  // @method getSize(): Point
  // Returns the size of the given bounds
  public getSize(): Point {
    return this.max.subtract(this.min);
  }

  // @method contains(otherBounds: Bounds): Boolean
  // Returns `true` if the rectangle contains the given one.
  // @alternative
  // @method contains(point: Point): Boolean
  // Returns `true` if the rectangle contains the given point.
  public contains(obj: Bounds | PointLike): boolean {
    let min;
    let max;

    if (obj instanceof Bounds) {
      obj = toBounds(obj);
    } else {
      obj = toPoint(obj as PointLike);
    }

    if (obj instanceof Bounds) {
      min = obj.min;
      max = obj.max;
    } else {
      min = max = obj;
    }

    return (
      min.x >= this.min.x &&
      max.x <= this.max.x &&
      min.y >= this.min.y &&
      max.y <= this.max.y
    );
  }

  // @method intersects(otherBounds: Bounds): Boolean
  // Returns `true` if the rectangle intersects the given bounds. Two bounds
  // intersect if they have at least one point in common.
  intersects(bounds: Bounds): boolean {
    // (Bounds) -> Boolean
    bounds = toBounds(bounds);

    const min = this.min;
    const max = this.max;
    const min2 = bounds.min;
    const max2 = bounds.max;
    const xIntersects = max2.x >= min.x && min2.x <= max.x;
    const yIntersects = max2.y >= min.y && min2.y <= max.y;

    return xIntersects && yIntersects;
  }

  // @method overlaps(otherBounds: Bounds): Boolean
  // Returns `true` if the rectangle overlaps the given bounds. Two bounds
  // overlap if their intersection is an area.
  public overlaps(bounds: Bounds): boolean {
    // (Bounds) -> Boolean
    bounds = toBounds(bounds);

    const min = this.min;
    const max = this.max;
    const min2 = bounds.min;
    const max2 = bounds.max;
    const xOverlaps = max2.x > min.x && min2.x < max.x;
    const yOverlaps = max2.y > min.y && min2.y < max.y;

    return xOverlaps && yOverlaps;
  }

  public isValid(): boolean {
    return !!(this.min && this.max);
  }
}

// @factory L.bounds(corner1: Point, corner2: Point)
// Creates a Bounds object from two corners coordinate pairs.
// @alternative
// @factory L.bounds(points: Point[])
// Creates a Bounds object from the given array of points.
export function toBounds(a: Bounds | PointLike, b?: PointLike): Bounds {
  if (!a || a instanceof Bounds) {
    return a;
  }
  return new Bounds(a, b);
}
