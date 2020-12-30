import { Bounds } from '../../geometry/Bounds';
import { LatLng } from '../LatLng';
import { LatLngBounds } from '../LatLngBounds';
import { wrapNum } from '@/core/Util';
import { Projection } from '../projection';
import { Transformation } from '@/geometry/Transformation';
import { Point } from '@/geometry/Point';

/*
 * @namespace CRS
 * @crs L.CRS.Base
 * Object that defines coordinate reference systems for projecting
 * geographical points into pixel (screen) coordinates and back (and to
 * coordinates in other units for [WMS](https://en.wikipedia.org/wiki/Web_Map_Service) services). See
 * [spatial reference system](http://en.wikipedia.org/wiki/Coordinate_reference_system).
 *
 * Leaflet defines the most usual CRSs by default. If you want to use a
 * CRS not defined by default, take a look at the
 * [Proj4Leaflet](https://github.com/kartena/Proj4Leaflet) plugin.
 *
 * Note that the CRS instances do not inherit from Leaflet's `Class` object,
 * and can't be instantiated. Also, new classes can't inherit from them,
 * and methods can't be added to them with the `include` function.
 */

export abstract class CRS {
  // @property code: String
  // Standard code name of the CRS passed into WMS services (e.g. `'EPSG:3857'`)
  public code?: string;
  // @property wrapLng: Number[]
  // An array of two numbers defining whether the longitude (horizontal) coordinate
  // axis wraps around a given range and how. Defaults to `[-180, 180]` in most
  // geographical CRSs. If `undefined`, the longitude axis does not wrap around.
  public wrapLng?: [number, number];
  // @property wrapLat: Number[]
  // Like `wrapLng`, but for the latitude (vertical) axis.
  public wrapLat?: [number, number];
  // @property infinite: Boolean
  public infinite = false;

  constructor(
    public projection: Projection,
    public transformation: Transformation,
  ) {}

  // @method distance(latlng1: LatLng, latlng2: LatLng): Number
  // Returns the distance between two geographical coordinates.
  abstract distance(latlng1: LatLng, latlng2: LatLng): number;

  // @method latLngToPoint(latlng: LatLng, zoom: Number): Point
  // Projects geographical coordinates into pixel coordinates for a given zoom.
  public latLngToPoint(latlng: LatLng, zoom: number): Point {
    const projectedPoint = this.projection.project(latlng);
    const scale = this.scale(zoom);

    return this.transformation._transform(projectedPoint, scale);
  }

  // @method pointToLatLng(point: Point, zoom: Number): LatLng
  // The inverse of `latLngToPoint`. Projects pixel coordinates on a given
  // zoom into geographical coordinates.
  public pointToLatLng(point: Point, zoom: number): LatLng {
    const scale = this.scale(zoom);
    const untransformedPoint = this.transformation.untransform(point, scale);

    return this.projection.unproject(untransformedPoint);
  }

  // @method project(latlng: LatLng): Point
  // Projects geographical coordinates into coordinates in units accepted for
  // this CRS (e.g. meters for EPSG:3857, for passing it to WMS services).
  public project(latlng: LatLng): Point {
    return this.projection.project(latlng);
  }

  // @method unproject(point: Point): LatLng
  // Given a projected coordinate returns the corresponding LatLng.
  // The inverse of `project`.
  public unproject(point: Point): LatLng {
    return this.projection.unproject(point);
  }

  // @method scale(zoom: Number): Number
  // Returns the scale used when transforming projected coordinates into
  // pixel coordinates for a particular zoom. For example, it returns
  // `256 * 2^zoom` for Mercator-based CRS.
  public scale(zoom: number): number {
    return 256 * Math.pow(2, zoom);
  }

  // @method zoom(scale: Number): Number
  // Inverse of `scale()`, returns the zoom level corresponding to a scale
  // factor of `scale`.
  public zoom(scale: number): number {
    return Math.log(scale / 256) / Math.LN2;
  }

  // @method getProjectedBounds(zoom: Number): Bounds
  // Returns the projection's bounds scaled and transformed for the provided `zoom`.
  public getProjectedBounds(zoom: number): Bounds | null {
    if (this.infinite) {
      return null;
    }

    const b = this.projection.bounds;
    const s = this.scale(zoom);
    const min = this.transformation.transform(b.min, s);
    const max = this.transformation.transform(b.max, s);

    return new Bounds(min, max);
  }

  // @method wrapLatLng(latlng: LatLng): LatLng
  // Returns a `LatLng` where lat and lng has been wrapped according to the
  // CRS's `wrapLat` and `wrapLng` properties, if they are outside the CRS's bounds.
  public wrapLatLng(latlng: LatLng): LatLng {
    const lng = this.wrapLng
        ? wrapNum(latlng.lng, this.wrapLng, true)
        : latlng.lng,
      lat = this.wrapLat ? wrapNum(latlng.lat, this.wrapLat, true) : latlng.lat,
      alt = latlng.alt;

    return new LatLng(lat, lng, alt);
  }

  // @method wrapLatLngBounds(bounds: LatLngBounds): LatLngBounds
  // Returns a `LatLngBounds` with the same size as the given one, ensuring
  // that its center is within the CRS's bounds.
  // Only accepts actual `L.LatLngBounds` instances, not arrays.
  public wrapLatLngBounds(bounds: LatLngBounds): LatLngBounds {
    const center = bounds.getCenter();
    const newCenter = this.wrapLatLng(center);
    const latShift = center.lat - newCenter.lat;
    const lngShift = center.lng - newCenter.lng;

    if (latShift === 0 && lngShift === 0) {
      return bounds;
    }

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const newSw = new LatLng(sw.lat - latShift, sw.lng - lngShift);
    const newNe = new LatLng(ne.lat - latShift, ne.lng - lngShift);

    return new LatLngBounds(newSw, newNe);
  }
}
