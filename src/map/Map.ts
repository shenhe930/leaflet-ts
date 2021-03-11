import { Evented } from '@/core/Events';
import { stamp } from '@/core/Util';
import * as Browser from '@/core/Browser';
import * as DomUtil from '@/dom/DomUtil';
import { CRS, EPSG3857 } from '@/geo/crs';
import { LatLng } from '@/geo/LatLng';
import { LatLngBounds } from '@/geo/LatLngBounds';
import { Point } from '@/geometry/Point';

interface MapOptions {
  crs?: CRS;
  center?: LatLng;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  layers?: any[];
  maxBounds?: LatLngBounds;
  renderer?: any;
  zoomAnimation?: boolean;
  zoomAnimationThreshold?: number;
  fadeAnimation?: boolean;
  markerZoomAnimation?: boolean;
  transform3DLimit?: number;
  zoomSnap?: number;
  zoomDelta?: number;
  trackResize?: boolean;
}

interface Panes {
  [name: string]: HTMLElement;
}

interface ControlCorners {
  [name: string]: HTMLElement;
}

export class Map extends Evented {
  public options: MapOptions = {
    // @section Map State Options
    // @option crs: CRS = L.CRS.EPSG3857
    // The [Coordinate Reference System](#crs) to use. Don't change this if you're not
    // sure what it means.
    crs: EPSG3857,

    // @option center: LatLng = undefined
    // Initial geographic center of the map
    center: undefined,

    // @option zoom: Number = undefined
    // Initial map zoom level
    zoom: undefined,

    // @option minZoom: Number = *
    // Minimum zoom level of the map.
    // If not specified and at least one `GridLayer` or `TileLayer` is in the map,
    // the lowest of their `minZoom` options will be used instead.
    minZoom: undefined,

    // @option maxZoom: Number = *
    // Maximum zoom level of the map.
    // If not specified and at least one `GridLayer` or `TileLayer` is in the map,
    // the highest of their `maxZoom` options will be used instead.
    maxZoom: undefined,

    // @option layers: Layer[] = []
    // Array of layers that will be added to the map initially
    layers: [],

    // @option maxBounds: LatLngBounds = null
    // When this option is set, the map restricts the view to the given
    // geographical bounds, bouncing the user back if the user tries to pan
    // outside the view. To set the restriction dynamically, use
    // [`setMaxBounds`](#map-setmaxbounds) method.
    maxBounds: undefined,

    // @option renderer: Renderer = *
    // The default method for drawing vector layers on the map. `L.SVG`
    // or `L.Canvas` by default depending on browser support.
    renderer: undefined,

    // @section Animation Options
    // @option zoomAnimation: Boolean = true
    // Whether the map zoom animation is enabled. By default it's enabled
    // in all browsers that support CSS3 Transitions except Android.
    zoomAnimation: true,

    // @option zoomAnimationThreshold: Number = 4
    // Won't animate zoom if the zoom difference exceeds this value.
    zoomAnimationThreshold: 4,

    // @option fadeAnimation: Boolean = true
    // Whether the tile fade animation is enabled. By default it's enabled
    // in all browsers that support CSS3 Transitions except Android.
    fadeAnimation: true,

    // @option markerZoomAnimation: Boolean = true
    // Whether markers animate their zoom with the zoom animation, if disabled
    // they will disappear for the length of the animation. By default it's
    // enabled in all browsers that support CSS3 Transitions except Android.
    markerZoomAnimation: true,

    // @option transform3DLimit: Number = 2^23
    // Defines the maximum size of a CSS translation transform. The default
    // value should not be changed unless a web browser positions layers in
    // the wrong place after doing a large `panBy`.
    transform3DLimit: 8388608, // Precision limit of a 32-bit float

    // @section Interaction Options
    // @option zoomSnap: Number = 1
    // Forces the map's zoom level to always be a multiple of this, particularly
    // right after a [`fitBounds()`](#map-fitbounds) or a pinch-zoom.
    // By default, the zoom level snaps to the nearest integer; lower values
    // (e.g. `0.5` or `0.1`) allow for greater granularity. A value of `0`
    // means the zoom level will not be snapped after `fitBounds` or a pinch-zoom.
    zoomSnap: 1,

    // @option zoomDelta: Number = 1
    // Controls how much the map's zoom level will change after a
    // [`zoomIn()`](#map-zoomin), [`zoomOut()`](#map-zoomout), pressing `+`
    // or `-` on the keyboard, or using the [zoom controls](#control-zoom).
    // Values smaller than `1` (e.g. `0.5`) allow for greater granularity.
    zoomDelta: 1,

    // @option trackResize: Boolean = true
    // Whether the map automatically handles browser window resize to update itself.
    trackResize: true,
  };
  private _zoom!: number;
  private _zoomAnimated!: boolean;
  private _containerId!: number;
  private _container!: HTMLElement;
  private _fadeAnimated!: boolean;
  private _mapPane!: HTMLElement;
  private _panes!: Panes;
  private _controlContainer!: HTMLElement;
  private _controlCorners!: ControlCorners;
  private _layersMinZoom?: number;
  private _layersMaxZoom?: number;
  constructor(id: string | HTMLElement, options?: MapOptions) {
    super();
    options = this.options = { ...this.options, ...options };
    this._initContainer(id);
    this._initLayout();

    if (options.zoom !== undefined) {
      this._zoom = this._limitZoom(options.zoom);
    }

    this._zoomAnimated = !!(
      DomUtil.TRANSITION &&
      Browser.any3d &&
      !Browser.mobileOpera &&
      this.options.zoomAnimation
    );
  }

  // @method getMinZoom(): Number
  // Returns the minimum zoom level of the map (if set in the `minZoom` option of the map or of any layers), or `0` by default.
  public getMinZoom(): number {
    return this.options.minZoom === undefined
      ? this._layersMinZoom || 0
      : this.options.minZoom;
  }

  // @method getMaxZoom(): Number
  // Returns the maximum zoom level of the map (if set in the `maxZoom` option of the map or of any layers).
  public getMaxZoom(): number {
    return this.options.maxZoom === undefined
      ? this._layersMaxZoom === undefined
        ? Infinity
        : this._layersMaxZoom
      : this.options.maxZoom;
  }

  // @section Other Methods
  // @method createPane(name: String, container?: HTMLElement): HTMLElement
  // Creates a new [map pane](#map-pane) with the given name if it doesn't exist already,
  // then returns it. The pane is created as a child of `container`, or
  // as a child of the main map pane if not set.
  public createPane(name: string, container?: HTMLElement): HTMLElement {
    const className =
      'leaflet-pane' +
      (name ? ' leaflet-' + name.replace('Pane', '') + '-pane' : '');
    const pane = DomUtil.create('div', className, container || this._mapPane);

    if (name) {
      this._panes[name] = pane;
    }
    return pane;
  }

  // map initialization methods
  private _initContainer(id: string | HTMLElement): void {
    const container = DomUtil.get(id);
    if (!container) {
      throw new Error('Map container not found.');
    } else if ((container as any)._leaflet_id) {
      throw new Error('Map container is already initialized.');
    }

    this._container = container;
    this._containerId = stamp(container);
  }

  private _initLayout() {
    const container = this._container;

    this._fadeAnimated = !!(this.options.fadeAnimation && Browser.any3d);

    DomUtil.addClass(
      container,
      'leaflet-container' +
        (Browser.touch ? ' leaflet-touch' : '') +
        (Browser.retina ? ' leaflet-retina' : '') +
        (Browser.ielt9 ? ' leaflet-oldie' : '') +
        (Browser.safari ? ' leaflet-safari' : '') +
        (this._fadeAnimated ? ' leaflet-fade-anim' : ''),
    );

    const position = DomUtil.getStyle(container, 'position');

    if (
      position !== 'absolute' &&
      position !== 'relative' &&
      position !== 'fixed'
    ) {
      container.style.position = 'relative';
    }

    this._initPanes();

    if (this._initControlPos) {
      this._initControlPos();
    }
  }

  private _initPanes(): void {
    const panes: Panes = (this._panes = {});

    // @section
    //
    // Panes are DOM elements used to control the ordering of layers on the map. You
    // can access panes with [`map.getPane`](#map-getpane) or
    // [`map.getPanes`](#map-getpanes) methods. New panes can be created with the
    // [`map.createPane`](#map-createpane) method.
    //
    // Every map has the following default panes that differ only in zIndex.
    //
    // @pane mapPane: HTMLElement = 'auto'
    // Pane that contains all other map panes

    this._mapPane = this.createPane('mapPane', this._container);
    DomUtil.setPosition(this._mapPane, new Point(0, 0));

    // @pane tilePane: HTMLElement = 200
    // Pane for `GridLayer`s and `TileLayer`s
    this.createPane('tilePane');
    // @pane overlayPane: HTMLElement = 400
    // Pane for vectors (`Path`s, like `Polyline`s and `Polygon`s), `ImageOverlay`s and `VideoOverlay`s
    this.createPane('overlayPane');
    // @pane shadowPane: HTMLElement = 500
    // Pane for overlay shadows (e.g. `Marker` shadows)
    this.createPane('shadowPane');
    // @pane markerPane: HTMLElement = 600
    // Pane for `Icon`s of `Marker`s
    this.createPane('markerPane');
    // @pane tooltipPane: HTMLElement = 650
    // Pane for `Tooltip`s.
    this.createPane('tooltipPane');
    // @pane popupPane: HTMLElement = 700
    // Pane for `Popup`s.
    this.createPane('popupPane');

    if (!this.options.markerZoomAnimation) {
      DomUtil.addClass(panes.markerPane, 'leaflet-zoom-hide');
      DomUtil.addClass(panes.shadowPane, 'leaflet-zoom-hide');
    }
  }

  private _initControlPos() {
    const corners: ControlCorners = (this._controlCorners = {});
    const l = 'leaflet-';
    const container = (this._controlContainer = DomUtil.create(
      'div',
      l + 'control-container',
      this._container,
    ));

    function createCorner(vSide: string, hSide: string) {
      const className = l + vSide + ' ' + l + hSide;

      corners[vSide + hSide] = DomUtil.create('div', className, container);
    }

    createCorner('top', 'left');
    createCorner('top', 'right');
    createCorner('bottom', 'left');
    createCorner('bottom', 'right');
  }

  private _limitZoom(zoom: number) {
    const min = this.getMinZoom();
    const max = this.getMaxZoom();
    const snap = Browser.any3d ? this.options.zoomSnap : 1;
    if (snap) {
      zoom = Math.round(zoom / snap) * snap;
    }
    return Math.max(min, Math.min(max, zoom));
  }
}
