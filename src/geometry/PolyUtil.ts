/*
 * @namespace PolyUtil
 * Various utility functions for polygon geometries.
 */

import { Bounds } from './Bounds';
import { getBitCode, getEdgeIntersection } from './LineUtil';
import { Point } from './Point';

interface PointWithCode extends Point {
  _code?: number;
}

/* @function clipPolygon(points: Point[], bounds: Bounds, round?: Boolean): Point[]
 * Clips the polygon geometry defined by the given `points` by the given bounds (using the [Sutherland-Hodgman algorithm](https://en.wikipedia.org/wiki/Sutherland%E2%80%93Hodgman_algorithm)).
 * Used by Leaflet to only show polygon points that are on the screen or near, increasing
 * performance. Note that polygon points needs different algorithm for clipping
 * than polyline, so there's a separate method for it.
 */
export function clipPolygon(
  points: Point[],
  bounds: Bounds,
  round = false,
): Point[] {
  let inputPoints: PointWithCode[] = points;
  let clippedPoints;
  const edges = [1, 4, 2, 8];
  let i = 0;
  let j = 0;
  let k = 0;
  let a;
  let b;
  let len;
  let edge;
  let p: PointWithCode;

  for (i = 0, len = inputPoints.length; i < len; i++) {
    inputPoints[i]._code = getBitCode(points[i], bounds);
  }

  // for each edge (left, bottom, right, top)
  for (k = 0; k < 4; k++) {
    edge = edges[k];
    clippedPoints = [];

    for (i = 0, len = inputPoints.length, j = len - 1; i < len; j = i++) {
      a = inputPoints[i];
      b = inputPoints[j];

      // if a is inside the clip window
      if (!((a._code || 0) & edge)) {
        // if b is outside the clip window (a->b goes out of screen)
        if ((b._code || 0) & edge) {
          p = getEdgeIntersection(b, a, edge, bounds, round);
          p._code = getBitCode(p, bounds);
          clippedPoints.push(p);
        }
        clippedPoints.push(a);

        // else if b is inside the clip window (a->b enters the screen)
      } else if (!((b._code || 0) & edge)) {
        p = getEdgeIntersection(b, a, edge, bounds, round);
        p._code = getBitCode(p, bounds);
        clippedPoints.push(p);
      }
    }
    inputPoints = clippedPoints;
  }

  return inputPoints;
}
