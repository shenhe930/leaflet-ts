import { Bounds } from '@/geometry/Bounds';
import { Point } from '@/geometry/Point';
import { LatLng } from '../LatLng';

export interface Projection {
  bounds: Bounds;
  project(laglng: LatLng): Point;
  unproject(point: Point): LatLng;
}
