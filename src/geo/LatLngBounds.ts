import { LatLng, LatLngLike, toLatLng } from './LatLng';

export type LatLngBoundsLike = LatLngBounds | LatLngLike[];

/*
 * @class LatLngBounds
 * @aka L.LatLngBounds
 *
 * Represents a rectangular geographical area on a map.
 *
 * @example
 *
 * ```js
 * var corner1 = L.latLng(40.712, -74.227),
 * corner2 = L.latLng(40.774, -74.125),
 * bounds = L.latLngBounds(corner1, corner2);
 * ```
 *
 * All Leaflet methods that accept LatLngBounds objects also accept them in a simple Array form (unless noted otherwise), so the bounds example above can be passed like this:
 *
 * ```js
 * map.fitBounds([
 * 	[40.712, -74.227],
 * 	[40.774, -74.125]
 * ]);
 * ```
 *
 * Caution: if the area crosses the antimeridian (often confused with the International Date Line), you must specify corners _outside_ the [-180, 180] degrees longitude range.
 *
 * Note that `LatLngBounds` does not inherit from Leaflet's `Class` object,
 * which means new classes can't inherit from it, and new methods
 * can't be added to it with the `include` function.
 */

export class LatLngBounds {
  public southWest!: LatLng;
  public northEast!: LatLng;

  constructor(corner1: LatLngLike | LatLngLike[], corner2?: LatLngLike) {
    if (!corner1) {
      return;
    }

    const latlngs = (corner2 ? [corner1, corner2] : corner1) as LatLngLike[];

    const len = latlngs.length;
    for (let i = 0; i < len; i++) {
      this.extend(latlngs[i]);
    }
  }

  // @method extend(latlng: LatLng): this
  // Extend the bounds to contain the given point

  // @alternative
  // @method extend(otherBounds: LatLngBounds): this
  // Extend the bounds to contain the given bounds
  public extend(obj: LatLngLike | LatLngBoundsLike): this {
    const sw = this.southWest;
    const ne = this.northEast;
    let sw2: LatLng;
    let ne2: LatLng;

    if (obj instanceof LatLng) {
      sw2 = obj;
      ne2 = obj;
    } else if (obj instanceof LatLngBounds) {
      sw2 = obj.southWest;
      ne2 = obj.northEast;

      if (!sw2 || !ne2) {
        return this;
      }
    } else {
      return obj
        ? this.extend(toLatLng(obj as any) || toLatLngBounds(obj as any))
        : this;
    }

    if (!sw && !ne) {
      this.southWest = new LatLng(sw2.lat, sw2.lng);
      this.northEast = new LatLng(ne2.lat, ne2.lng);
    } else {
      sw.lat = Math.min(sw2.lat, sw.lat);
      sw.lng = Math.min(sw2.lng, sw.lng);
      ne.lat = Math.max(ne2.lat, ne.lat);
      ne.lng = Math.max(ne2.lng, ne.lng);
    }

    return this;
  }

  // @method pad(bufferRatio: Number): LatLngBounds
  // Returns bounds created by extending or retracting the current bounds by a given ratio in each direction.
  // For example, a ratio of 0.5 extends the bounds by 50% in each direction.
  // Negative values will retract the bounds.
  public pad(bufferRatio: number): LatLngBounds {
    const sw = this.southWest;
    const ne = this.northEast;
    const heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio;
    const widthBuffer = Math.abs(sw.lng - ne.lng) * bufferRatio;

    return new LatLngBounds(
      new LatLng(sw.lat - heightBuffer, sw.lng - widthBuffer),
      new LatLng(ne.lat + heightBuffer, ne.lng + widthBuffer),
    );
  }

  // @method getCenter(): LatLng
  // Returns the center point of the bounds.
  public getCenter(): LatLng {
    return new LatLng(
      (this.southWest.lat + this.northEast.lat) / 2,
      (this.southWest.lng + this.northEast.lng) / 2,
    );
  }

  // @method getWest(): Number
  // Returns the west longitude of the bounds
  public getWest(): number {
    return this.southWest.lng;
  }

  // @method getSouth(): Number
  // Returns the south latitude of the bounds
  public getSouth(): number {
    return this.southWest.lat;
  }

  // @method getEast(): Number
  // Returns the east longitude of the bounds
  public getEast(): number {
    return this.northEast.lng;
  }

  // @method getNorth(): Number
  // Returns the north latitude of the bounds
  public getNorth(): number {
    return this.northEast.lat;
  }

  // @method getSouthWest(): LatLng
  // Returns the south-west point of the bounds.
  public getSouthWest(): LatLng {
    return this.southWest;
  }

  // @method getNorthEast(): LatLng
  // Returns the north-east point of the bounds.
  public getNorthEast(): LatLng {
    return this.northEast;
  }

  // @method getNorthWest(): LatLng
  // Returns the north-west point of the bounds.
  public getNorthWest(): LatLng {
    return new LatLng(this.getNorth(), this.getWest());
  }

  // @method getSouthEast(): LatLng
  // Returns the south-east point of the bounds.
  public getSouthEast(): LatLng {
    return new LatLng(this.getSouth(), this.getEast());
  }
}

// TODO International date line?

// @factory L.latLngBounds(corner1: LatLng, corner2: LatLng)
// Creates a `LatLngBounds` object by defining two diagonally opposite corners of the rectangle.

// @alternative
// @factory L.latLngBounds(latlngs: LatLng[])
// Creates a `LatLngBounds` object defined by the geographical points it contains. Very useful for zooming the map to fit a particular set of locations with [`fitBounds`](#map-fitbounds).
export function toLatLngBounds(
  a: LatLngBoundsLike,
  b?: LatLngLike,
): LatLngBounds {
  if (a instanceof LatLngBounds) {
    return a;
  }
  return new LatLngBounds(a, b);
}
