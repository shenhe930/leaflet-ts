import { LatLng } from '../LatLng';
import { Bounds } from '@/geometry/Bounds';
import { Point } from '@/geometry/Point';
import { Projection } from './index';

/*
 * @namespace Projection
 * @projection L.Projection.SphericalMercator
 *
 * Spherical Mercator projection — the most common projection for online maps,
 * used by almost all free and commercial tile providers. Assumes that Earth is
 * a sphere. Used by the `EPSG:3857` CRS.
 */

export const R = 6378137;
const MAX_LATITUDE = 85.0511287798;

export const SphericalMercator: Projection = {
  project(latlng: LatLng): Point {
    const d = Math.PI / 180;
    const max = MAX_LATITUDE;
    const lat = Math.max(Math.min(max, latlng.lat), -max);
    const sin = Math.sin(lat * d);

    return new Point(
      R * latlng.lng * d,
      (R * Math.log((1 + sin) / (1 - sin))) / 2,
    );
  },

  unproject(point: Point): LatLng {
    const d = 180 / Math.PI;

    return new LatLng(
      (2 * Math.atan(Math.exp(point.y / R)) - Math.PI / 2) * d,
      (point.x * d) / R,
    );
  },

  bounds: (function () {
    const d = R * Math.PI;
    return new Bounds([-d, -d], [d, d]);
  })(),
};
