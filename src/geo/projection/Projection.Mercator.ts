/*
 * @namespace Projection
 * @projection L.Projection.Mercator
 *
 * Elliptical Mercator projection — more complex than Spherical Mercator. Assumes that Earth is an ellipsoid. Used by the EPSG:3395 CRS.
 */

import { Bounds } from '@/geometry/Bounds';
import { Point } from '@/geometry/Point';
import { Projection } from './index';
import { LatLng } from '../LatLng';

export const R = 6378137;
const R_MINOR = 6356752.314245179;

export const Mercator: Projection = {
  bounds: new Bounds(
    [-20037508.34279, -15496570.73972],
    [20037508.34279, 18764656.23138],
  ),

  project(latlng: LatLng): Point {
    const d = Math.PI / 180;
    const r = R;
    const tmp = R_MINOR / r;
    const e = Math.sqrt(1 - tmp * tmp);

    let y = latlng.lat * d;
    const con = e * Math.sin(y);

    const ts =
      Math.tan(Math.PI / 4 - y / 2) / Math.pow((1 - con) / (1 + con), e / 2);
    y = -r * Math.log(Math.max(ts, 1e-10));

    return new Point(latlng.lng * d * r, y);
  },

  unproject(point: Point): LatLng {
    const d = 180 / Math.PI;
    const r = R;
    const tmp = R_MINOR / r;
    const e = Math.sqrt(1 - tmp * tmp);
    const ts = Math.exp(-point.y / r);
    let phi = Math.PI / 2 - 2 * Math.atan(ts);

    for (let i = 0, dphi = 0.1, con; i < 15 && Math.abs(dphi) > 1e-7; i++) {
      con = e * Math.sin(phi);
      con = Math.pow((1 - con) / (1 + con), e / 2);
      dphi = Math.PI / 2 - 2 * Math.atan(ts * con) - phi;
      phi += dphi;
    }

    return new LatLng(phi * d, (point.x * d) / r);
  },
};
