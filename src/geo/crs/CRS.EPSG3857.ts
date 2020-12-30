import { toTransformation } from '@/geometry/Transformation';
import {
  SphericalMercator,
  R,
} from '../projection/Projection.SphericalMercator';
import { Earth } from './CRS.Earth';

class EPSG3857CRS extends Earth {
  public code = '3857';
  constructor() {
    super(
      SphericalMercator,
      (function () {
        const scale = 0.5 / (Math.PI * R);
        return toTransformation(scale, 0.5, -scale, 0.5);
      })(),
    );
  }
}

class EPSG900913CRS extends EPSG3857CRS {
  public code = '900913';
}

export const EPSG3857 = new EPSG3857CRS();
export const EPSG900913 = new EPSG900913CRS();
