import { toTransformation } from '@/geometry/Transformation';
import { LatLng } from '../LatLng';
import { LonLat } from '../projection/Projection.LonLat';
import { CRS } from './CRS';

/*
 * @namespace CRS
 * @crs L.CRS.Simple
 *
 * A simple CRS that maps longitude and latitude into `x` and `y` directly.
 * May be used for maps of flat surfaces (e.g. game maps). Note that the `y`
 * axis should still be inverted (going from bottom to top). `distance()` returns
 * simple euclidean distance.
 */

class SimpleCRS extends CRS {
  public infinite = true;
  constructor() {
    super(LonLat, toTransformation(1, 0, -1, 0));
  }

  public scale(zoom: number): number {
    return Math.pow(2, zoom);
  }

  public zoom(scale: number): number {
    return Math.log(scale) / Math.LN2;
  }

  public distance(latlng1: LatLng, latlng2: LatLng): number {
    const dx = latlng2.lng - latlng1.lng;
    const dy = latlng2.lat - latlng1.lat;

    return Math.sqrt(dx * dx + dy * dy);
  }
}

export const Simple = new SimpleCRS();
