import { toTransformation } from '@/geometry/Transformation';
import { LonLat } from './../projection/Projection.LonLat';
import { Earth } from './CRS.Earth';

class EPSG4326CRS extends Earth {
  public code = '4326';
  constructor() {
    super(LonLat, toTransformation(1 / 180, 1, -1 / 180, 0.5));
  }
}

export const EPSG4326 = new EPSG4326CRS();
