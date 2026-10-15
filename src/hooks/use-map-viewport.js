import { useCallback, useEffect, useRef, useState } from 'react';

// Below 1 so the whole country fits even when the initial view is framed on the corridors.
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 80;
const WHEEL_STEP = 1.25;
// Pointer travel (px) before a press counts as a drag instead of a click.
const DRAG_THRESHOLD_PX = 4;

const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * Pan and zoom for an SVG map by moving its viewBox.
 * Wheel and pinch zoom around the pointer and drag pans. The view center can reach any point of
 * `panBounds` (SVG units), so edges of the country can be brought to the middle at any zoom.
 * Clicks that end a drag are swallowed so panning does not select units or add drawing points.
 */
export const useMapViewport = (width, height, panBounds = null) => {
  const svgRef = useRef(null);
  const [view, setView] = useState({ x: 0, y: 0, w: width, h: height });
  const viewRef = useRef(view);
  viewRef.current = view;
  const pointers = useRef(new Map());
  const gesture = useRef({ moved: false });

  useEffect(() => {
    setView({ x: 0, y: 0, w: width, h: height });
  }, [width, height]);

  const clamp = useCallback(
    (next) => {
      const w = Math.min(width / MIN_ZOOM, Math.max(width / MAX_ZOOM, next.w));
      const h = (w * height) / width;
      const area = panBounds || { minX: 0, minY: 0, maxX: width, maxY: height };
      const cx = Math.min(area.maxX, Math.max(area.minX, next.x + w / 2));
      const cy = Math.min(area.maxY, Math.max(area.minY, next.y + h / 2));
      return { x: cx - w / 2, y: cy - h / 2, w, h };
    },
    [width, height, panBounds]
  );

  // Zoom `base` by `factor` keeping the SVG point `anchor` fixed on screen.
  const zoomView = useCallback(
    (base, factor, anchor) => {
      const w = Math.min(width / MIN_ZOOM, Math.max(width / MAX_ZOOM, base.w / factor));
      const ratio = w / base.w;
      const center = anchor || { x: base.x + base.w / 2, y: base.y + base.h / 2 };
      return clamp({ x: center.x - (center.x - base.x) * ratio, y: center.y - (center.y - base.y) * ratio, w });
    },
    [clamp, width]
  );

  const toSvgPoint = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  }, []);

  const zoomBy = useCallback((factor) => setView((current) => zoomView(current, factor)), [zoomView]);

  const zoomTo = useCallback(
    (center, zoom) => {
      const w = width / Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
      const h = (w * height) / width;
      setView(clamp({ x: center.x - w / 2, y: center.y - h / 2, w }));
    },
    [clamp, width, height]
  );

  const reset = useCallback(() => setView({ x: 0, y: 0, w: width, h: height }), [width, height]);

  // Wheel needs a non-passive listener so the page does not scroll while zooming the map.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;
    const onWheel = (event) => {
      event.preventDefault();
      const anchor = toSvgPoint(event.clientX, event.clientY);
      const factor = event.deltaY < 0 ? WHEEL_STEP : 1 / WHEEL_STEP;
      setView((current) => zoomView(current, factor, anchor));
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [toSvgPoint, zoomView]);

  const startGesture = useCallback(() => {
    const svg = svgRef.current;
    const [first, second] = [...pointers.current.values()];
    gesture.current = {
      moved: gesture.current.moved,
      startView: viewRef.current,
      unitsPerPx: svg ? 1 / svg.getScreenCTM().a : 1,
      start: first,
      pinch: second ? { distance: distance(first, second), anchor: toSvgPoint(midpoint(first, second).x, midpoint(first, second).y) } : null,
    };
  }, [toSvgPoint]);

  useEffect(() => {
    const onMove = (event) => {
      if (!pointers.current.has(event.pointerId)) return;
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const { startView, unitsPerPx, start, pinch } = gesture.current;
      const [first, second] = [...pointers.current.values()];

      if (pinch && second) {
        gesture.current.moved = true;
        setView(zoomView(startView, distance(first, second) / pinch.distance, pinch.anchor));
        return;
      }
      const dx = first.x - start.x;
      const dy = first.y - start.y;
      if (!gesture.current.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
      gesture.current.moved = true;
      setView(clamp({ ...startView, x: startView.x - dx * unitsPerPx, y: startView.y - dy * unitsPerPx }));
    };
    const onUp = (event) => {
      if (!pointers.current.delete(event.pointerId)) return;
      if (pointers.current.size) startGesture();
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [clamp, zoomView, startGesture]);

  const onPointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (!pointers.current.size) gesture.current.moved = false;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    startGesture();
  };

  const onClickCapture = (event) => {
    if (gesture.current.moved) {
      event.stopPropagation();
      gesture.current.moved = false;
    }
  };

  return {
    svgRef,
    view,
    zoom: width / view.w,
    zoomBy,
    zoomTo,
    reset,
    toSvgPoint,
    bind: { onPointerDown, onClickCapture },
  };
};
