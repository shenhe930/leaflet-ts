/* @class LatLng
 * @aka L.LatLng
 *
 * Represents a geographical point with a certain latitude and longitude.
 *
 * @example
 *
 * ```
 * var latlng = L.latLng(50.5, 30.5);
 * ```
 *
 * All Leaflet methods that accept LatLng objects also accept them in a simple Array form and simple object form (unless noted otherwise), so these lines are equivalent:
 *
 * ```
 * map.panTo([50, 30]);
 * map.panTo({lon: 30, lat: 50});
 * map.panTo({lat: 50, lng: 30});
 * map.panTo(L.latLng(50, 30));
 * ```
 *
 * Note that `LatLng` does not inherit from Leaflet's `Class` object,
 * which means new classes can't inherit from it, and new methods
 * can't be added to it with the `include` function.
 */

import { formatNum, isArray } from '@/core/Util';

export class LatLng {
  public lat: number;
  public lng: number;
  public alt: number | undefined;
  constructor(lat: number, lng: number, alt?: number) {
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')');
    }

    // @property lat: Number
    // Latitude in degrees
    this.lat = +lat;

    // @property lng: Number
    // Longitude in degrees
    this.lng = +lng;

    // @property alt: Number
    // Altitude in meters (optional)
    if (alt !== undefined) {
      this.alt = +alt;
    }
  }

  // @method equals(otherLatLng: LatLng, maxMargin?: Number): Boolean
  // Returns `true` if the given `LatLng` point is at the same position (within a small margin of error). The margin of error can be overridden by setting `maxMargin` to a small number.
  public equals(obj: LatLngLike, maxMargin?: number): boolean {
    if (!obj) {
      return false;
    }

    const instance = toLatLng(obj);
    if (!instance) {
      return false;
    }

    const margin = Math.max(
      Math.abs(this.lat - instance.lat),
      Math.abs(this.lng - instance.lng),
    );

    return margin <= (maxMargin === undefined ? 1.0e-9 : maxMargin);
  }

  // @method toString(): String
  // Returns a string representation of the point (for debugging purposes).
  public toString(precision?: number): string {
    return (
      'LatLng(' +
      formatNum(this.lat, precision) +
      ', ' +
      formatNum(this.lng, precision) +
      ')'
    );
  }

  public clone(): LatLng {
    return new LatLng(this.lat, this.lng, this.alt);
  }
}

export type LatLngLike =
  | LatLng
  | [number, number, number]
  | [number, number]
  | { lat: number; lng: number; alt?: number }
  | { lat: number; lon: number; alt?: number };

// @factory L.latLng(latitude: Number, longitude: Number, altitude?: Number): LatLng
// Creates an object representing a geographical point with the given latitude and longitude (and optionally altitude).

// @alternative
// @factory L.latLng(coords: Array): LatLng
// Expects an array of the form `[Number, Number]` or `[Number, Number, Number]` instead.

// @alternative
// @factory L.latLng(coords: Object): LatLng
// Expects an plain object of the form `{lat: Number, lng: Number}` or `{lat: Number, lng: Number, alt: Number}` instead.
export function toLatLng(a: LatLngLike, b?: number, c?: number): LatLng | null {
  if (a instanceof LatLng) {
    return a;
  }
  if (isArray(a) && typeof a[0] === 'number') {
    if (a.length === 3) {
      return new LatLng(a[0], a[1], a[2]);
    }
    if (a.length === 2) {
      return new LatLng(a[0], a[1]);
    }
    return null;
  }

  if (a === undefined || a === null) {
    return a;
  }

  if (typeof a === 'object' && 'lat' in a) {
    return new LatLng(a.lat, 'lng' in a ? a.lng : a.lon, a.alt);
  }
  if (b === undefined) {
    return null;
  }

  if (typeof a === 'number') {
    return new LatLng(a, b, c);
  }

  return null;
}
