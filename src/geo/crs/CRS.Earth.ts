import { LatLng } from '../LatLng';
import { CRS } from './CRS';

export abstract class Earth extends CRS {
  public wrapLng: [number, number] = [-180, 180];

  // Mean Earth Radius, as recommended for use by
  // the International Union of Geodesy and Geophysics,
  // see http://rosettacode.org/wiki/Haversine_formula
  public static R = 6371000;

  // distance between two geographical points using spherical law of cosines approximation
  public distance(latlng1: LatLng, latlng2: LatLng): number {
    const rad = Math.PI / 180;
    const lat1 = latlng1.lat * rad;
    const lat2 = latlng2.lat * rad;
    const sinDLat = Math.sin(((latlng2.lat - latlng1.lat) * rad) / 2);
    const sinDLon = Math.sin(((latlng2.lng - latlng1.lng) * rad) / 2);
    const a =
      sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Earth.R * c;
  }
}
