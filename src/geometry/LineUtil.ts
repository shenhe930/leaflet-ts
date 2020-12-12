import { Bounds } from '.';
import { Point } from './Point';

/*
 * @namespace LineUtil
 *
 * Various utility functions for polyline points processing, used by Leaflet internally to make polylines lightning-fast.
 */

function sqDist(p1: Point, p2: Point) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return dx * dx + dy * dy;
}

// reduce points that are too close to each other to a single point
function reducePoints(points: Point[], sqTolerance: number) {
  const reducedPoints = [points[0]];

  const len = points.length;
  let prev = 0;
  for (let i = 1; i < len; i++) {
    if (sqDist(points[i], points[prev]) > sqTolerance) {
      reducedPoints.push(points[i]);
      prev = i;
    }
  }
  if (prev < len - 1) {
    reducedPoints.push(points[len - 1]);
  }
  return reducedPoints;
}

function simplifyDPStep(
  points: Point[],
  markers: number[] | Uint8Array,
  sqTolerance: number,
  first: number,
  last: number,
) {
  let maxSqDist = 0;
  let index: number | null = null;
  let sqDist: number;

  for (let i = first + 1; i <= last - 1; i++) {
    sqDist = sqClosestPointOnSegment(
      points[i],
      points[first],
      points[last],
      true,
    );

    if (sqDist > maxSqDist) {
      index = i;
      maxSqDist = sqDist;
    }
  }

  if (index !== null && maxSqDist > sqTolerance) {
    markers[index] = 1;

    simplifyDPStep(points, markers, sqTolerance, first, index);
    simplifyDPStep(points, markers, sqTolerance, index, last);
  }
}

// return closest point on segment or distance to that point
export function sqClosestPointOnSegment(
  p: Point,
  p1: Point,
  p2: Point,
  sqDist?: false,
): Point;
export function sqClosestPointOnSegment(
  p: Point,
  p1: Point,
  p2: Point,
  sqDist?: true,
): number;
export function sqClosestPointOnSegment(
  p: Point,
  p1: Point,
  p2: Point,
  sqDist?: boolean,
): Point | number {
  let x = p1.x;
  let y = p1.y;
  let dx = p2.x - x;
  let dy = p2.y - y;
  let t;
  const dot = dx * dx + dy * dy;

  if (dot > 0) {
    t = ((p.x - x) * dx + (p.y - y) * dy) / dot;

    if (t > 1) {
      x = p2.x;
      y = p2.y;
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = p.x - x;
  dy = p.y - y;

  return sqDist ? dx * dx + dy * dy : new Point(x, y);
}

// Douglas-Peucker simplification, see http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm
function simplifyDP(points: Point[], sqTolerance: number) {
  const len = points.length;
  const ArrayConstructor =
      typeof Uint8Array !== undefined + '' ? Uint8Array : Array,
    markers: number[] | Uint8Array = new ArrayConstructor(len);

  markers[0] = markers[len - 1] = 1;

  simplifyDPStep(points, markers, sqTolerance, 0, len - 1);

  const newPoints = [];

  for (let i = 0; i < len; i++) {
    if (markers[i]) {
      newPoints.push(points[i]);
    }
  }

  return newPoints;
}

// Simplify polyline with vertex reduction and Douglas-Peucker simplification.
// Improves rendering performance dramatically by lessening the number of points to draw.

// @function simplify(points: Point[], tolerance: Number): Point[]
// Dramatically reduces the number of points in a polyline while retaining
// its shape and returns a new array of simplified points, using the
// [Douglas-Peucker algorithm](http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm).
// Used for a huge performance boost when processing/displaying Leaflet polylines for
// each zoom level and also reducing visual noise. tolerance affects the amount of
// simplification (lesser value means higher quality but slower and with more points).
// Also released as a separated micro-library [Simplify.js](http://mourner.github.com/simplify-js/).
export function simplify(points: Point[], tolerance: number): Point[] {
  if (!tolerance || !points.length) {
    return points.slice();
  }

  const sqTolerance = tolerance * tolerance;

  // stage 1: vertex reduction
  points = reducePoints(points, sqTolerance);

  // stage 2: Douglas-Peucker simplification
  points = simplifyDP(points, sqTolerance);

  return points;
}

// @function pointToSegmentDistance(p: Point, p1: Point, p2: Point): Number
// Returns the distance between point `p` and segment `p1` to `p2`.
export function pointToSegmentDistance(p: Point, p1: Point, p2: Point): number {
  return Math.sqrt(sqClosestPointOnSegment(p, p1, p2, true));
}

// @function closestPointOnSegment(p: Point, p1: Point, p2: Point): Number
// Returns the closest point from a point `p` on a segment `p1` to `p2`.
export function closestPointOnSegment(p: Point, p1: Point, p2: Point): Point {
  return sqClosestPointOnSegment(p, p1, p2);
}

export function getBitCode(p: Point, bounds: Bounds): number {
  let code = 0;

  if (p.x < bounds.min.x) {
    // left
    code |= 1;
  } else if (p.x > bounds.max.x) {
    // right
    code |= 2;
  }

  if (p.y < bounds.min.y) {
    // bottom
    code |= 4;
  } else if (p.y > bounds.max.y) {
    // top
    code |= 8;
  }

  return code;
}

export function getEdgeIntersection(
  a: Point,
  b: Point,
  code: number,
  bounds: Bounds,
  round: boolean,
): Point {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const min = bounds.min;
  const max = bounds.max;
  let x = 0;
  let y = 0;

  if (code & 8) {
    // top
    x = a.x + (dx * (max.y - a.y)) / dy;
    y = max.y;
  } else if (code & 4) {
    // bottom
    x = a.x + (dx * (min.y - a.y)) / dy;
    y = min.y;
  } else if (code & 2) {
    // right
    x = max.x;
    y = a.y + (dy * (max.x - a.x)) / dx;
  } else if (code & 1) {
    // left
    x = min.x;
    y = a.y + (dy * (min.x - a.x)) / dx;
  }

  return new Point(x, y, round);
}

let lastCode: number;
// @function clipSegment(a: Point, b: Point, bounds: Bounds, useLastCode?: Boolean, round?: Boolean): Point[]|Boolean
// Clips the segment a to b by rectangular bounds with the
// [Cohen-Sutherland algorithm](https://en.wikipedia.org/wiki/Cohen%E2%80%93Sutherland_algorithm)
// (modifying the segment points directly!). Used by Leaflet to only show polyline
// points that are on the screen or near, increasing performance.
export function clipSegment(
  a: Point,
  b: Point,
  bounds: Bounds,
  useLastCode: boolean,
  round: boolean,
): Point[] | false {
  let codeA = useLastCode ? lastCode : getBitCode(a, bounds);
  let codeB = getBitCode(b, bounds);
  let codeOut;
  let p;
  let newCode;

  // save 2nd code to avoid calculating it on the next segment
  lastCode = codeB;

  while (!(codeA | codeB) || codeA & codeB) {
    // other cases
    codeOut = codeA || codeB;
    p = getEdgeIntersection(a, b, codeOut, bounds, round);
    newCode = getBitCode(p, bounds);

    if (codeOut === codeA) {
      a = p;
      codeA = newCode;
    } else {
      b = p;
      codeB = newCode;
    }
  }

  // if a,b is inside the clip window (trivial accept)
  if (!(codeA | codeB)) {
    return [a, b];
  }

  // if a,b is outside the clip window (trivial reject)
  if (codeA & codeB) {
    return false;
  }

  return false;
}
