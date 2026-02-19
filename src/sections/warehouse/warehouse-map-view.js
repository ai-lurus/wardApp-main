import { useCallback, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { ZoneMaterialsPanel } from './zone-materials-panel';

function darkenColor(hex, amount = 40) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

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

export const WarehouseMapView = ({ zones, config, allMaterials, onAssign, onUnassign }) => {
  const [selectedZone, setSelectedZone] = useState(null);

  // Auto-select first zone on load; sync selected zone on refresh
  useEffect(() => {
    if (selectedZone) {
      const updated = zones.find((z) => z.id === selectedZone.id);
      if (updated) setSelectedZone(updated);
    } else if (zones.length > 0) {
      setSelectedZone(zones[0]);
    }
  }, [zones]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleZoneClick = useCallback((zone) => {
    setSelectedZone(zone);
  }, []);

  const handleAssign = useCallback(async (materialId, zoneId) => {
    await onAssign(materialId, zoneId);
    // Refresh the selected zone's materials from parent re-render
  }, [onAssign]);

  const handleUnassign = useCallback(async (materialId) => {
    await onUnassign(materialId);
  }, [onUnassign]);

  const widthM = config?.widthM || 50;
  const heightM = config?.heightM || 30;

  const Y_RULER_W = 46;
  const X_RULER_H = 22;

  return (
    <Box sx={{ display: 'flex', height: '100%', gap: 0 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Haz clic en una zona para ver y gestionar sus materiales.
        </Typography>

        {/* Wrapper reserving space for rulers */}
        <Box sx={{ position: 'relative', pl: `${Y_RULER_W}px`, pb: `${X_RULER_H}px` }}>

          {/* Y ruler */}
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: Y_RULER_W, bottom: X_RULER_H, pointerEvents: 'none' }}>
            {Array.from({ length: 11 }, (_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  top: `${i * 10}%`,
                  right: 6,
                  transform: i === 0 ? 'translateY(0)' : i === 10 ? 'translateY(-100%)' : 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <Typography sx={{ fontSize: 10, color: 'text.disabled', lineHeight: 1, whiteSpace: 'nowrap' }}>
                  {(i * heightM / 10).toFixed(0)}m
                </Typography>
                <Box sx={{ width: 4, height: '1px', bgcolor: 'divider', flexShrink: 0 }} />
              </Box>
            ))}
          </Box>

          {/* SVG map */}
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
            }}
          >
          <svg
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
          >
            <GridLines />

            {zones.map((zone) => {
              const hasLowStock = zone.materials.some(
                (m) => m.currentStock <= m.minStock
              );
              const isSelected = selectedZone?.id === zone.id;

              return (
                <g key={zone.id} style={{ cursor: 'pointer' }} onClick={() => handleZoneClick(zone)}>
                  <rect
                    x={zone.xPct}
                    y={zone.yPct}
                    width={zone.wPct}
                    height={zone.hPct}
                    fill={hexToRgba(zone.color, 0.3)}
                    stroke={isSelected ? '#000' : darkenColor(zone.color)}
                    strokeWidth={isSelected ? 0.7 : 0.4}
                  />
                  {/* Low stock overlay */}
                  {hasLowStock && (
                    <rect
                      x={zone.xPct}
                      y={zone.yPct}
                      width={zone.wPct}
                      height={zone.hPct}
                      fill="rgba(255, 152, 0, 0.2)"
                      style={{ pointerEvents: 'none' }}
                    />
                  )}

                  {/* Zone label */}
                  <text
                    x={zone.xPct + zone.wPct / 2}
                    y={zone.yPct + zone.hPct / 2 - 2}
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
                    y={zone.yPct + zone.hPct / 2 + 2.5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={Math.min(zone.wPct, zone.hPct) * 0.13}
                    fill={darkenColor(zone.color, 60)}
                    style={{ pointerEvents: 'none' }}
                  >
                    {zone.materials.length} material{zone.materials.length !== 1 ? 'es' : ''}
                  </text>

                  {/* Material count badge */}
                  {zone.materials.length > 0 && (
                    <>
                      <circle
                        cx={zone.xPct + zone.wPct - 2.5}
                        cy={zone.yPct + 2.5}
                        r={2.5}
                        fill={hasLowStock ? '#FF9800' : darkenColor(zone.color, 30)}
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
                        {zone.materials.length}
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            <rect x={0} y={0} width={100} height={100} fill="none" stroke="#bdbdbd" strokeWidth={0.5} />
          </svg>

          </Box> {/* end SVG map */}

          {/* X ruler */}
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: X_RULER_H, pointerEvents: 'none' }}>
            {Array.from({ length: 11 }, (_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  left: `${i * 10}%`,
                  top: 0,
                  transform: i === 0 ? 'translateX(0)' : i === 10 ? 'translateX(-100%)' : 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                <Box sx={{ width: '1px', height: 4, bgcolor: 'divider' }} />
                <Typography sx={{ fontSize: 10, color: 'text.disabled', lineHeight: 1, whiteSpace: 'nowrap' }}>
                  {(i * widthM / 10).toFixed(0)}m
                </Typography>
              </Box>
            ))}
          </Box>

        </Box> {/* end wrapper */}

        {/* Legend + scale */}
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: 'rgba(255,152,0,0.4)', border: '1px solid #FF9800', borderRadius: 0.5 }} />
            <Typography variant="caption" color="text.secondary">Zona con stock bajo</Typography>
          </Box>
        </Box>

      </Box>

      <ZoneMaterialsPanel
        zone={selectedZone}
        allMaterials={allMaterials}
        onAssign={handleAssign}
        onUnassign={handleUnassign}
      />
    </Box>
  );
};
