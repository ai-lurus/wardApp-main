import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ArrowsPointingOutIcon from '@heroicons/react/24/solid/ArrowsPointingOutIcon';
import InformationCircleIcon from '@heroicons/react/24/solid/InformationCircleIcon';
import MinusIcon from '@heroicons/react/24/solid/MinusIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Popover,
  Stack,
  SvgIcon,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { mexicoOutline } from 'src/data/mexico-outline';
import { MAX_ZOOM, MIN_ZOOM, useMapViewport } from 'src/hooks/use-map-viewport';
import { boundsOf, createProjection, fitBoundsToAspect, toSvgPath, travelledPath } from 'src/utils/gps-route';
import { GeofenceLayer, HotspotLayer, TrafficLayer } from './gps-map-layers';
import { GpsMapCounters, GpsMapLegend } from './gps-map-legend';
import { GpsMapUnits } from './gps-map-units';
import { UnitStatusPill } from './gps-status';

const NO_LAYERS = { geofences: false, hotspots: false, traffic: false };
const MAP_WIDTH = 1000;
const ZOOM_BUTTON_STEP = 1.6;
// Touch screens get 44 px controls.
const TOUCH_TARGET = { '@media (pointer: coarse)': { width: 44, height: 44 } };
// Fitting to filtered units: padding around them and the closest zoom for a single unit.
const FIT_PADDING = 1.6;
const FIT_MAX_ZOOM = 20;
// City labels flip to the left when closer than this (screen px) to the right edge of the view.
const LABEL_FLIP_MARGIN_PX = 120;

// Strokes keep their on-screen width while the map zooms.
const fixedStroke = { vectorEffect: 'non-scaling-stroke', fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };

const useElementSize = (ref) => {
  const [size, setSize] = useState({ width: 800, height: 560 });
  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return size;
};

const ZoomControls = ({ zoom, atHome, onZoomIn, onZoomOut, onReset, legendOpen, onToggleLegend }) => (
  <Paper elevation={2}
sx={{ position: 'absolute', right: 12, bottom: 12, borderRadius: 1 }}>
    <Stack>
      <Tooltip title="Acercar"
placement="left">
        <span>
          <IconButton size="small"
sx={TOUCH_TARGET}
onClick={onZoomIn}
aria-label="Acercar"
disabled={zoom >= MAX_ZOOM - 0.01}>
            <SvgIcon fontSize="small"><PlusIcon /></SvgIcon>
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Alejar"
placement="left">
        <span>
          <IconButton size="small"
sx={TOUCH_TARGET}
onClick={onZoomOut}
aria-label="Alejar"
disabled={zoom <= MIN_ZOOM + 0.01}>
            <SvgIcon fontSize="small"><MinusIcon /></SvgIcon>
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Volver a la vista inicial"
placement="left">
        <span>
          <IconButton size="small"
sx={TOUCH_TARGET}
onClick={onReset}
aria-label="Volver a la vista inicial"
disabled={atHome}>
            <SvgIcon fontSize="small"><ArrowsPointingOutIcon /></SvgIcon>
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={legendOpen ? 'Ocultar leyenda' : 'Mostrar leyenda'}
        placement="left">
        <IconButton size="small"
sx={TOUCH_TARGET}
          onClick={onToggleLegend}
          aria-label={legendOpen ? 'Ocultar leyenda' : 'Mostrar leyenda'}
          aria-pressed={legendOpen}
          color={legendOpen ? 'primary' : 'default'}>
          <SvgIcon fontSize="small"><InformationCircleIcon /></SvgIcon>
        </IconButton>
      </Tooltip>
    </Stack>
  </Paper>
);

ZoomControls.propTypes = {
  zoom: PropTypes.number,
  atHome: PropTypes.bool,
  legendOpen: PropTypes.bool,
  onToggleLegend: PropTypes.func,
  onZoomIn: PropTypes.func,
  onZoomOut: PropTypes.func,
  onReset: PropTypes.func,
};

/**
 * Lightweight SVG map for the GPS demo. No tiles or external map library:
 * draws a simplified Mexico outline, highway corridors, cities and live units.
 * Supports wheel/pinch zoom, drag to pan, and groups nearby units into bubbles when zoomed out.
 */
export const GpsFleetMap = (props) => {
  const {
    units = [],
    routes = [],
    cities = {},
    selectedId = null,
    onSelect = () => {},
    focusPoints = null,
    height = 560,
    aspectRatio = 1.4,
    geofences = [],
    hotspots = [],
    traffic = [],
    layers = NO_LAYERS,
    toolbar = null,
    // Message shown over the top of the map (e.g. drawing instructions).
    banner = null,
    // Content pinned to the bottom center of the map (used on phones).
    footer = null,
    drawing = false,
    draftPoints = [],
    // 'line' for hot routes (click points), 'circle' for geofences (center, then edge).
    drawMode = 'line',
    onMapClick = () => {},
    fitPoints = null,
    // Smooth marker movement between live updates; off for replay, where the slider drives position.
    animateUnits = true,
    fitKey = null,
  } = props;

  const theme = useTheme();
  const containerRef = useRef(null);
  const size = useElementSize(containerRef);
  // Units of a bubble that still overlaps at max zoom, listed in a popover.
  const [openCluster, setOpenCluster] = useState(null);
  // The legend starts hidden on phones so it does not cover the map.
  const isPhone = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const [legendOpen, setLegendOpen] = useState(!isPhone);
  useEffect(() => setLegendOpen(!isPhone), [isPhone]);

  const projection = useMemo(() => {
    const points = focusPoints || routes.flatMap((route) => route.points);
    const bounds = points.length
      ? boundsOf(points, focusPoints ? 0.5 : 1.1)
      : { minLat: 14, maxLat: 33, minLng: -118, maxLng: -86 };
    return createProjection(fitBoundsToAspect(bounds, aspectRatio), MAP_WIDTH);
  }, [routes, focusPoints, aspectRatio]);

  const { project, unproject, height: viewHeight, scale } = projection;
  // Pan area: the whole country outline plus the initial frame, so any border city can be centered.
  const panBounds = useMemo(() => {
    const projected = mexicoOutline.map(project);
    const xs = [0, MAP_WIDTH, ...projected.map(([x]) => x)];
    const ys = [0, viewHeight, ...projected.map(([, y]) => y)];
    return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
  }, [project, viewHeight]);
  const { svgRef, view, zoom, zoomBy, zoomTo, reset, toSvgPoint, bind } = useMapViewport(MAP_WIDTH, viewHeight, panBounds);
  // Screen pixels per SVG unit at the current zoom (the SVG is letterboxed with "meet").
  const pxPerUnit = Math.min(size.width / view.w, size.height / view.h);

  // When fitKey changes, center and zoom on fitPoints ([lat, lng]); read through a ref so live movement does not refit.
  const fitPointsRef = useRef(fitPoints);
  fitPointsRef.current = fitPoints;
  useEffect(() => {
    const points = fitPointsRef.current;
    if (!fitKey) {
      reset();
      return;
    }
    if (!points?.length) return;
    const projected = points.map(project);
    const xs = projected.map(([x]) => x);
    const ys = projected.map(([, y]) => y);
    const spanW = (Math.max(...xs) - Math.min(...xs)) * FIT_PADDING;
    const spanH = (Math.max(...ys) - Math.min(...ys)) * FIT_PADDING * (MAP_WIDTH / viewHeight);
    const zoomLevel = Math.min(FIT_MAX_ZOOM, MAP_WIDTH / Math.max(spanW, spanH, 1));
    zoomTo({ x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 }, zoomLevel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey]);
  const inverse = 1 / zoom;

  // Only draw overlays for the corridors shown on this map. Drawn hot routes are not tied to one, so they always show.
  const routeIds = useMemo(() => new Set(routes.map((route) => route.id)), [routes]);
  const visibleTraffic = traffic.filter((segment) => routeIds.has(segment.routeId));
  const visibleHotspots = hotspots.filter((spot) => !spot.routeId || routeIds.has(spot.routeId));

  // While drawing, a click on the map becomes a [lat, lng] point (drags only pan).
  const handleSvgClick = (event) => {
    if (!drawing) return;
    const point = toSvgPoint(event.clientX, event.clientY);
    if (point) onMapClick(unproject([point.x, point.y]));
  };

  const landPath = useMemo(() => `${toSvgPath(mexicoOutline, project)} Z`, [project]);
  const selectedUnit = units.find((unit) => unit.id === selectedId);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        height,
        borderRadius: 1,
        overflow: 'hidden',
        backgroundColor: alpha(theme.palette.info.main, 0.08),
      }}
    >
      <Box
        component="svg"
        ref={svgRef}
        onClick={handleSvgClick}
        {...bind}
        viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Mapa de flota. Arrastra para moverte y usa la rueda para acercar."
        sx={{
          width: '100%',
          height: '100%',
          display: 'block',
          touchAction: 'none',
          userSelect: 'none',
          cursor: drawing ? 'crosshair' : 'grab',
          '&:active': { cursor: drawing ? 'crosshair' : 'grabbing' },
        }}
      >
        <path
          d={landPath}
          fill={theme.palette.background.paper}
          stroke={theme.palette.neutral[300]}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />

        {layers.hotspots && <HotspotLayer hotspots={visibleHotspots}
project={project} />}

        {layers.traffic ? (
          <TrafficLayer routes={routes}
traffic={visibleTraffic}
project={project} />
        ) : (
          routes.map((route) => (
            <path
              key={route.id}
              d={toSvgPath(route.points, project)}
              stroke={theme.palette.neutral[300]}
              strokeWidth={3}
              {...fixedStroke}
            />
          ))
        )}

        {layers.geofences && <GeofenceLayer geofences={geofences}
project={project}
scale={scale}
zoom={zoom} />}

        {selectedUnit && (
          <>
            <path
              d={toSvgPath(selectedUnit.route.points, project)}
              stroke={alpha(theme.palette.primary.main, 0.35)}
              strokeWidth={5}
              strokeDasharray="8 8"
              {...fixedStroke}
            />
            <path
              d={toSvgPath(travelledPath(selectedUnit.route.points, selectedUnit.progress), project)}
              stroke={theme.palette.primary.main}
              strokeWidth={5}
              {...fixedStroke}
            />
          </>
        )}

        {Object.entries(cities).map(([code, city]) => {
          const [x, y] = project(city.position);
          const flipLabel = (view.x + view.w - x) * pxPerUnit < LABEL_FLIP_MARGIN_PX;
          return (
            <g key={code}
transform={`translate(${x}, ${y}) scale(${inverse})`}
pointerEvents="none">
              <circle r={4}
fill={theme.palette.neutral[500]} />
              <text
                x={flipLabel ? -8 : 8}
                y={-6}
                textAnchor={flipLabel ? 'end' : 'start'}
                fontSize={14}
                fontFamily={theme.typography.fontFamily}
                fill={theme.palette.neutral[600]}
              >
                {city.name.split(',')[0]}
              </text>
            </g>
          );
        })}

        {drawing && draftPoints.length > 0 && (
          <g pointerEvents="none">
            {drawMode === 'circle' && draftPoints.length === 2 && (() => {
              const [cx, cy] = project(draftPoints[0]);
              const [ex, ey] = project(draftPoints[1]);
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={Math.hypot(ex - cx, ey - cy)}
                  fill={alpha(theme.palette.primary.main, 0.15)}
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })()}
            {drawMode === 'line' && (
              <path
                d={toSvgPath(draftPoints, project)}
                stroke={theme.palette.error.main}
                strokeWidth={4}
                strokeDasharray="10 6"
                {...fixedStroke}
              />
            )}
            {draftPoints.map((point, index) => {
              const [x, y] = project(point);
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r={6 * inverse}
                  fill={drawMode === 'circle' ? theme.palette.primary.main : theme.palette.error.main}
                  stroke={theme.palette.common.white}
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </g>
        )}

        <GpsMapUnits
          units={units}
          project={project}
          zoom={zoom}
          view={view}
          pxPerUnit={pxPerUnit}
          selectedId={selectedId}
          drawing={drawing}
          onSelect={onSelect}
          onZoomTo={zoomTo}
          animate={animateUnits}
          onOpenCluster={(items, event) => setOpenCluster({ items, anchor: { top: event.clientY, left: event.clientX } })}
        />
      </Box>

      {toolbar && (
        <Box sx={{ position: 'absolute', top: 12, left: 12, right: { xs: 12, md: 220 }, zIndex: 1 }}>
          {toolbar}
        </Box>
      )}
      {banner && (
        <Box sx={{ position: 'absolute', top: 56, left: 12, right: 12, zIndex: 2, display: 'flex', justifyContent: 'center' }}>
          {banner}
        </Box>
      )}
      {legendOpen && <GpsMapLegend layers={layers} />}
      {footer && (
        <Box sx={{ position: 'absolute', left: 12, right: 64, bottom: 12, zIndex: 2, display: 'flex', justifyContent: 'center' }}>
          {footer}
        </Box>
      )}
      <GpsMapCounters units={units}
layers={layers} />
      <Popover
        open={Boolean(openCluster)}
        anchorReference="anchorPosition"
        anchorPosition={openCluster?.anchor}
        onClose={() => setOpenCluster(null)}
      >
        <List dense
sx={{ maxHeight: 320, overflowY: 'auto', minWidth: 240 }}>
          {openCluster?.items.map((unit) => (
            <ListItemButton
              key={unit.id}
              onClick={() => {
                onSelect(unit.id);
                setOpenCluster(null);
              }}
            >
              <ListItemText primary={unit.eco}
secondary={unit.driver?.name} />
              <UnitStatusPill status={unit.status} />
            </ListItemButton>
          ))}
        </List>
      </Popover>
      <ZoomControls
        zoom={zoom}
        legendOpen={legendOpen}
        onToggleLegend={() => setLegendOpen((open) => !open)}
        atHome={Math.abs(zoom - 1) < 0.01 && Math.abs(view.x) < 0.5 && Math.abs(view.y) < 0.5}
        onZoomIn={() => zoomBy(ZOOM_BUTTON_STEP)}
        onZoomOut={() => zoomBy(1 / ZOOM_BUTTON_STEP)}
        onReset={reset}
      />
    </Box>
  );
};

GpsFleetMap.propTypes = {
  units: PropTypes.array,
  routes: PropTypes.array,
  cities: PropTypes.object,
  selectedId: PropTypes.string,
  onSelect: PropTypes.func,
  focusPoints: PropTypes.array,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.object]),
  aspectRatio: PropTypes.number,
  geofences: PropTypes.array,
  hotspots: PropTypes.array,
  traffic: PropTypes.array,
  layers: PropTypes.object,
  toolbar: PropTypes.node,
  banner: PropTypes.node,
  footer: PropTypes.node,
  drawing: PropTypes.bool,
  draftPoints: PropTypes.array,
  drawMode: PropTypes.oneOf(['line', 'circle']),
  onMapClick: PropTypes.func,
  fitPoints: PropTypes.array,
  fitKey: PropTypes.string,
  animateUnits: PropTypes.bool,
};
