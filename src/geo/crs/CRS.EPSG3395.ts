import { toTransformation } from '@/geometry/Transformation';
import { Mercator, R } from '../projection/Projection.Mercator';
import { Earth } from './CRS.Earth';

class EPSG3395CRS extends Earth {
  public code = '3395';
  constructor() {
    super(
      Mercator,
      (function () {
        const scale = 0.5 / (Math.PI * R);
        return toTransformation(scale, 0.5, -scale, 0.5);
      })(),
    );
  }
}

export const EPSG3395 = new EPSG3395CRS();
