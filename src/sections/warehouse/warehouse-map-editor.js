import { useCallback, useRef, useState } from 'react';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { ZoneCreateModal } from './zone-create-modal';
import { ZonePanel } from './zone-panel';

const MIN_SIZE_PCT = 2; // Minimum 2% in each dimension to create a zone

// Darken a hex color slightly for the border
function darkenColor(hex, amount = 40) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Convert hex + opacity to rgba
function hexToRgba(hex, alpha) {
  const num = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

const GridLines = () => {
  const lines = [];
  for (let i = 10; i < 100; i += 10) {
    lines.push(
      <line key={`v${i}`} x1={i} y1={0} x2={i} y2={100} stroke="#e0e0e0" strokeWidth={0.3} />,
      <line key={`h${i}`} x1={0} y1={i} x2={100} y2={i} stroke="#e0e0e0" strokeWidth={0.3} />
    );
  }
  return <>{lines}</>;
};

const Y_RULER_W = 46; // px reserved for y-axis ruler
const X_RULER_H = 22; // px reserved for x-axis ruler

export const WarehouseMapEditor = ({ zones, config, onZoneCreate, onZoneUpdate, onZoneDelete }) => {
  const svgRef = useRef(null);
  const [drawing, setDrawing] = useState(null); // { startX, startY, currentX, currentY }
  const [createModal, setCreateModal] = useState({ open: false, rect: null });
  const [selectedZone, setSelectedZone] = useState(null);

  const getSvgCoords = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
  }, []);

  const handleMouseDown = useCallback((e) => {
    // Only start drawing on background click (not zone click)
    if (e.target.dataset.zone) return;
    e.preventDefault();
    const { x, y } = getSvgCoords(e);
    setDrawing({ startX: x, startY: y, currentX: x, currentY: y });
    setSelectedZone(null);
  }, [getSvgCoords]);

  const handleMouseMove = useCallback((e) => {
    if (!drawing) return;
    e.preventDefault();
    const { x, y } = getSvgCoords(e);
    setDrawing((d) => ({ ...d, currentX: x, currentY: y }));
  }, [drawing, getSvgCoords]);

  const handleMouseUp = useCallback((e) => {
    if (!drawing) return;
    e.preventDefault();
    const { x, y } = getSvgCoords(e);

    const xPct = Math.min(drawing.startX, x);
    const yPct = Math.min(drawing.startY, y);
    const wPct = Math.abs(x - drawing.startX);
    const hPct = Math.abs(y - drawing.startY);

    setDrawing(null);

    if (wPct >= MIN_SIZE_PCT && hPct >= MIN_SIZE_PCT) {
      setCreateModal({ open: true, rect: { xPct, yPct, wPct, hPct } });
    }
  }, [drawing, getSvgCoords]);

  const handleZoneClick = useCallback((e, zone) => {
    e.stopPropagation();
    setSelectedZone(zone);
  }, []);

  const handleModalSave = useCallback(async (values) => {
    await onZoneCreate(values);
    setCreateModal({ open: false, rect: null });
  }, [onZoneCreate]);

  const handleZoneSave = useCallback(async (id, values) => {
    await onZoneUpdate(id, values);
    setSelectedZone(null);
  }, [onZoneUpdate]);

  const handleZoneDelete = useCallback(async (id) => {
    await onZoneDelete(id);
    setSelectedZone(null);
  }, [onZoneDelete]);

  // Preview rect while drawing
  const previewRect = drawing
    ? {
        x: Math.min(drawing.startX, drawing.currentX),
        y: Math.min(drawing.startY, drawing.currentY),
        w: Math.abs(drawing.currentX - drawing.startX),
        h: Math.abs(drawing.currentY - drawing.startY),
      }
    : null;

  const widthM = config?.widthM || 50;
  const heightM = config?.heightM || 30;

  return (
    <Box sx={{ display: 'flex', height: '100%', gap: 0 }}>
      {/* SVG container with preserved aspect ratio */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Haz clic y arrastra para dibujar una zona. Clic en una zona existente para editarla.
        </Typography>

        {/* Wrapper that reserves space for X and Y rulers */}
        <Box sx={{ position: 'relative', pl: `${Y_RULER_W}px`, pb: `${X_RULER_H}px` }}>

          {/* ── Y ruler (left side) ── */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: Y_RULER_W,
              bottom: X_RULER_H,
              pointerEvents: 'none',
            }}
          >
            {Array.from({ length: 11 }, (_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  top: `${i * 10}%`,
                  right: 6,
                  transform:
                    i === 0 ? 'translateY(0)' :
                    i === 10 ? 'translateY(-100%)' :
                    'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <Typography sx={{ fontSize: 10, color: 'text.disabled', lineHeight: 1, whiteSpace: 'nowrap' }}>
                  {(i * heightM / 10).toFixed(0)}m
                </Typography>
                {/* tick */}
                <Box sx={{ width: 4, height: '1px', bgcolor: 'divider', flexShrink: 0 }} />
              </Box>
            ))}
          </Box>

          {/* ── SVG map ── */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              paddingTop: `${(heightM / widthM) * 100}%`,
              bgcolor: '#fafafa',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden',
              cursor: 'crosshair',
            }}
          >
          <svg
            ref={svgRef}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              userSelect: 'none',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <GridLines />

            {/* Existing zones */}
            {zones.map((zone) => (
              <g key={zone.id}>
                <rect
                  data-zone={zone.id}
                  x={zone.xPct}
                  y={zone.yPct}
                  width={zone.wPct}
                  height={zone.hPct}
                  fill={hexToRgba(zone.color, 0.3)}
                  stroke={selectedZone?.id === zone.id ? '#000' : darkenColor(zone.color)}
                  strokeWidth={selectedZone?.id === zone.id ? 0.6 : 0.4}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => handleZoneClick(e, zone)}
                />
                {/* Zone label */}
                <text
                  x={zone.xPct + zone.wPct / 2}
                  y={zone.yPct + zone.hPct / 2 - 1.5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={Math.min(zone.wPct, zone.hPct) * 0.18}
                  fill={darkenColor(zone.color, 80)}
                  style={{ pointerEvents: 'none', fontWeight: '600' }}
                >
                  {zone.name}
                </text>
                <text
                  x={zone.xPct + zone.wPct / 2}
                  y={zone.yPct + zone.hPct / 2 + 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={Math.min(zone.wPct, zone.hPct) * 0.14}
                  fill={darkenColor(zone.color, 60)}
                  style={{ pointerEvents: 'none' }}
                >
                  {((zone.wPct * widthM / 100) * (zone.hPct * heightM / 100)).toFixed(0)} m²
                </text>
                {/* Material count badge */}
                {zone.materialCount > 0 && (
                  <>
                    <circle
                      cx={zone.xPct + zone.wPct - 2.5}
                      cy={zone.yPct + 2.5}
                      r={2.5}
                      fill={darkenColor(zone.color, 30)}
                      style={{ pointerEvents: 'none' }}
                    />
                    <text
                      x={zone.xPct + zone.wPct - 2.5}
                      y={zone.yPct + 2.5}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={2.2}
                      fill="white"
                      fontWeight="bold"
                      style={{ pointerEvents: 'none' }}
                    >
                      {zone.materialCount}
                    </text>
                  </>
                )}
              </g>
            ))}

            {/* Preview while drawing */}
            {previewRect && previewRect.w >= 0.5 && previewRect.h >= 0.5 && (() => {
              const realW = (previewRect.w * widthM / 100).toFixed(1);
              const realH = (previewRect.h * heightM / 100).toFixed(1);
              const areaM2 = (parseFloat(realW) * parseFloat(realH)).toFixed(1);
              const labelSize = Math.min(previewRect.w, previewRect.h) * 0.16;
              const showLabel = previewRect.w >= 8 && previewRect.h >= 6;
              return (
                <g style={{ pointerEvents: 'none' }}>
                  <rect
                    x={previewRect.x}
                    y={previewRect.y}
                    width={previewRect.w}
                    height={previewRect.h}
                    fill="rgba(33, 150, 243, 0.15)"
                    stroke="#2196F3"
                    strokeWidth={0.4}
                    strokeDasharray="1 0.5"
                  />
                  {showLabel && (
                    <>
                      {/* Background pill for legibility */}
                      <rect
                        x={previewRect.x + previewRect.w / 2 - labelSize * 4.5}
                        y={previewRect.y + previewRect.h / 2 - labelSize * 1.4}
                        width={labelSize * 9}
                        height={labelSize * 2.8}
                        rx={labelSize * 0.5}
                        fill="rgba(255,255,255,0.85)"
                      />
                      <text
                        x={previewRect.x + previewRect.w / 2}
                        y={previewRect.y + previewRect.h / 2 - labelSize * 0.3}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={labelSize}
                        fill="#1565C0"
                        fontWeight="600"
                      >
                        {realW} × {realH} m
                      </text>
                      <text
                        x={previewRect.x + previewRect.w / 2}
                        y={previewRect.y + previewRect.h / 2 + labelSize * 1.1}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={labelSize * 0.85}
                        fill="#1976D2"
                      >
                        {areaM2} m²
                      </text>
                    </>
                  )}
                </g>
              );
            })()}

            {/* Border */}
            <rect x={0} y={0} width={100} height={100} fill="none" stroke="#bdbdbd" strokeWidth={0.5} />
          </svg>

          </Box> {/* end SVG map */}

          {/* ── X ruler (bottom) ── */}
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: X_RULER_H, pointerEvents: 'none' }}>
            {Array.from({ length: 11 }, (_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  left: `${i * 10}%`,
                  top: 0,
                  transform:
                    i === 0 ? 'translateX(0)' :
                    i === 10 ? 'translateX(-100%)' :
                    'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                {/* tick */}
                <Box sx={{ width: '1px', height: 4, bgcolor: 'divider' }} />
                <Typography sx={{ fontSize: 10, color: 'text.disabled', lineHeight: 1, whiteSpace: 'nowrap' }}>
                  {(i * widthM / 10).toFixed(0)}m
                </Typography>
              </Box>
            ))}
          </Box>

        </Box> {/* end wrapper */}

        {/* Scale legend */}
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              px: 1.5,
              py: 0.5,
            }}
          >
            {/* mini grid icon */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="14" height="14" stroke="#9e9e9e" strokeWidth="1" fill="none" />
              <line x1="8" y1="1" x2="8" y2="15" stroke="#9e9e9e" strokeWidth="0.8" />
              <line x1="1" y1="8" x2="15" y2="8" stroke="#9e9e9e" strokeWidth="0.8" />
            </svg>
            <Typography variant="caption" color="text.secondary">
              Cada cuadrícula&nbsp;=&nbsp;
              <strong>{(widthM / 10).toFixed(1)}m × {(heightM / 10).toFixed(1)}m</strong>
              &nbsp;({((widthM / 10) * (heightM / 10)).toFixed(1)} m²)
            </Typography>
          </Box>
          <Typography variant="caption" color="text.disabled">
            Total: {widthM}m × {heightM}m
          </Typography>
        </Box>

      </Box>

      {/* Side panel for selected zone */}
      {selectedZone && (
        <ZonePanel
          zone={selectedZone}
          widthM={widthM}
          heightM={heightM}
          onClose={() => setSelectedZone(null)}
          onSave={handleZoneSave}
          onDelete={handleZoneDelete}
        />
      )}

      {/* Create modal */}
      <ZoneCreateModal
        open={createModal.open}
        rect={createModal.rect}
        onClose={() => setCreateModal({ open: false, rect: null })}
        onSave={handleModalSave}
      />
    </Box>
  );
};
