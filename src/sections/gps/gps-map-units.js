import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { keyframes, useTheme } from '@mui/material/styles';
import { clusterPoints, dominantStatus } from 'src/utils/gps-cluster';
import { MAX_ZOOM } from 'src/hooks/use-map-viewport';
import { unitStatusMap } from './gps-status';

// Markers closer than this on screen are grouped into one bubble.
const CLUSTER_RADIUS_PX = 36;
// At max zoom only markers that really overlap stay grouped (e.g. trucks parked in the same yard).
const OVERLAP_RADIUS_PX = 14;
// Zooming into a bubble multiplies the zoom by this much.
const CLUSTER_ZOOM_STEP = 3;
// Selected unit tags flip to the left when closer than this (screen px) to the right edge.
const TAG_FLIP_MARGIN_PX = 140;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2.6); opacity: 0; }
`;

const STATUS_ORDER = Object.keys(unitStatusMap);

const clusterTitle = (items) => {
  const counts = STATUS_ORDER.map((status) => [status, items.filter((item) => item.status === status).length])
    .filter(([, count]) => count)
    .map(([status, count]) => `${count} ${unitStatusMap[status].label.toLowerCase()}`);
  return `${items.length} unidades: ${counts.join(', ')}.`;
};

/**
 * Unit markers and cluster bubbles. Everything is drawn inside a scale(1/zoom) group so
 * markers keep the same size on screen while the map zooms.
 */
export const GpsMapUnits = (props) => {
  const { units, project, zoom, view, pxPerUnit, selectedId, drawing, onSelect, onZoomTo, onOpenCluster, animate = true } = props;
  const theme = useTheme();
  const colorFor = (status) => theme.palette[unitStatusMap[status]?.color || 'info'].main;
  const inverse = 1 / zoom;

  const placed = useMemo(
    () =>
      units
        .filter((unit) => unit.position)
        .map((unit) => {
          const [x, y] = project(unit.position);
          return { ...unit, x, y };
        }),
    [units, project]
  );

  const clusters = useMemo(() => {
    const free = placed.filter((unit) => unit.id !== selectedId);
    const radiusPx = zoom >= MAX_ZOOM - 0.01 ? OVERLAP_RADIUS_PX : CLUSTER_RADIUS_PX;
    return clusterPoints(free, radiusPx / pxPerUnit);
  }, [placed, selectedId, zoom, pxPerUnit]);

  const selected = placed.find((unit) => unit.id === selectedId);
  const singles = [...clusters.filter((cluster) => cluster.items.length === 1).map((c) => c.items[0]), ...(selected ? [selected] : [])];
  const groups = clusters.filter((cluster) => cluster.items.length > 1);

  return (
    <g>
      {singles.map((unit) => {
        const color = colorFor(unit.status);
        const isSelected = unit.id === selectedId;
        const tagWidth = unit.eco.length * 9 + 16;
        const nearRightEdge = (view.x + view.w - unit.x) * pxPerUnit < TAG_FLIP_MARGIN_PX;
        return (
          <Box
            component="g"
            key={unit.id}
            onClick={() => !drawing && onSelect(unit.id)}
            sx={{ cursor: 'pointer', transform: `translate(${unit.x}px, ${unit.y}px)`, transition: animate ? 'transform 2s linear' : 'none' }}
          >
            <g transform={`scale(${inverse})`}>
              {unit.status === 'moving' && (
                <Box component="circle"
r={10}
fill={color}
sx={{ animation: `${pulse} 2s ease-out infinite` }} />
              )}
              {unit.unauthorizedStop && (
                <circle r={17}
fill="none"
stroke={theme.palette.error.main}
strokeWidth={3}
strokeDasharray="4 3">
                  <title>{`Parada no autorizada: ${unit.unauthorizedStop.reason}`}</title>
                </circle>
              )}
              <circle r={isSelected ? 13 : 10}
fill={color}
stroke={theme.palette.common.white}
strokeWidth={isSelected ? 4 : 3} />
              {unit.status === 'moving' && (
                <g transform={`rotate(${unit.heading.toFixed(0)})`}>
                  <path d="M0,-6 L4.5,4 L0,1.5 L-4.5,4 Z"
fill={theme.palette.common.white} />
                </g>
              )}
              {isSelected && (
                <g transform={`translate(${nearRightEdge ? -(18 + tagWidth) : 18}, -18)`}>
                  <rect x={0}
y={-16}
rx={6}
width={tagWidth}
height={26}
fill={theme.palette.neutral[900]} />
                  <text x={8}
y={2}
fontSize={14}
fontWeight={600}
fontFamily={theme.typography.fontFamily}
fill={theme.palette.common.white}>
                    {unit.eco}
                  </text>
                </g>
              )}
            </g>
          </Box>
        );
      })}

      {groups.map((cluster) => {
        const count = cluster.items.length;
        const radius = 14 + Math.min(12, Math.log2(count) * 3);
        const color = colorFor(dominantStatus(cluster.items, STATUS_ORDER));
        return (
          <g
            key={cluster.items[0].id}
            transform={`translate(${cluster.x}, ${cluster.y}) scale(${inverse})`}
            onClick={(event) => {
              if (drawing) return;
              // Bubbles that still overlap at max zoom open a list instead of zooming further.
              if (zoom >= MAX_ZOOM - 0.01) onOpenCluster(cluster.items, event);
              else onZoomTo({ x: cluster.x, y: cluster.y }, zoom * CLUSTER_ZOOM_STEP);
            }}
            style={{ cursor: 'zoom-in' }}
          >
            <title>{clusterTitle(cluster.items)}</title>
            <circle r={radius + 5}
fill={color}
opacity={0.25} />
            <circle r={radius}
fill={color}
stroke={theme.palette.common.white}
strokeWidth={3} />
            {cluster.items.some((item) => item.unauthorizedStop) && (
              <g transform={`translate(${radius * 0.75}, ${-radius * 0.75})`}>
                <circle r={8}
fill={theme.palette.error.main}
stroke={theme.palette.common.white}
strokeWidth={2} />
                <text textAnchor="middle"
dominantBaseline="central"
fontSize={10}
fontWeight={700}
fill={theme.palette.common.white}>
                  !
                </text>
              </g>
            )}
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={count > 99 ? 12 : 14}
              fontWeight={700}
              fontFamily={theme.typography.fontFamily}
              fill={theme.palette.common.white}
            >
              {count}
            </text>
          </g>
        );
      })}
    </g>
  );
};

GpsMapUnits.propTypes = {
  units: PropTypes.array,
  project: PropTypes.func,
  zoom: PropTypes.number,
  view: PropTypes.object,
  pxPerUnit: PropTypes.number,
  selectedId: PropTypes.string,
  drawing: PropTypes.bool,
  onSelect: PropTypes.func,
  onZoomTo: PropTypes.func,
  onOpenCluster: PropTypes.func,
  animate: PropTypes.bool,
};
