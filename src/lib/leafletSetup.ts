import L from 'leaflet';

// 1. Fix default marker icon assets for Leaflet in Vite bundler
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// 2. Fix Leaflet crash when map is destroyed or unmounted during zoom/pan transitions:
// TypeError: Cannot read properties of undefined (reading '_leaflet_pos')
if (L.DomUtil && typeof L.DomUtil.getPosition === 'function') {
  const origGetPosition = L.DomUtil.getPosition;
  L.DomUtil.getPosition = function (el: HTMLElement) {
    if (!el || typeof el !== 'object') {
      return new L.Point(0, 0);
    }
    return origGetPosition.call(this, el) || new L.Point(0, 0);
  };
}

if (L.Map && L.Map.prototype) {
  const proto = L.Map.prototype as any;

  if (proto._getMapPanePos) {
    const origGetMapPanePos = proto._getMapPanePos;
    proto._getMapPanePos = function () {
      if (!this._mapPane) {
        return new L.Point(0, 0);
      }
      try {
        return origGetMapPanePos.call(this) || new L.Point(0, 0);
      } catch {
        return new L.Point(0, 0);
      }
    };
  }

  if (proto._getNewPixelOrigin) {
    const origGetNewPixelOrigin = proto._getNewPixelOrigin;
    proto._getNewPixelOrigin = function (center: any, zoom: any) {
      if (!this._mapPane || !this._container) {
        return new L.Point(0, 0);
      }
      try {
        return origGetNewPixelOrigin.call(this, center, zoom);
      } catch {
        return new L.Point(0, 0);
      }
    };
  }

  if (proto._onZoomTransitionEnd) {
    const origOnZoomTransitionEnd = proto._onZoomTransitionEnd;
    proto._onZoomTransitionEnd = function () {
      if (!this._mapPane || !this._container) {
        this._animatingZoom = false;
        return;
      }
      try {
        origOnZoomTransitionEnd.call(this);
      } catch (err) {
        this._animatingZoom = false;
      }
    };
  }

  if (proto._catchTransitionEnd) {
    const origCatchTransitionEnd = proto._catchTransitionEnd;
    proto._catchTransitionEnd = function (e: any) {
      if (!this._mapPane || !this._container) {
        return;
      }
      try {
        origCatchTransitionEnd.call(this, e);
      } catch {
        // safely ignore
      }
    };
  }
}

export default L;
