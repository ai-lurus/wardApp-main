// Aggregation and export helpers for GPS reports.

const sum = (rows, key) => rows.reduce((acc, row) => acc + row[key], 0);

// Percentage of driven km that stayed on the planned route.
const compliance = (rows) => {
  const km = sum(rows, 'km');
  return km ? Math.max(0, Math.round((100 - (sum(rows, 'deviationKm') / km) * 100) * 10) / 10) : null;
};

const avgDelay = (rows) => {
  const worked = rows.filter((row) => row.km > 0);
  return worked.length ? Math.round(sum(worked, 'delayMinutes') / worked.length) : null;
};

export const summarize = (rows) => ({
  km: sum(rows, 'km'),
  movingMinutes: sum(rows, 'movingMinutes'),
  stoppedMinutes: sum(rows, 'stoppedMinutes'),
  stops: sum(rows, 'stops'),
  unauthorizedStops: sum(rows, 'unauthorizedStops'),
  speeding: sum(rows, 'speeding'),
  dieselLiters: sum(rows, 'dieselLiters'),
  compliancePct: compliance(rows),
  avgDelayMinutes: avgDelay(rows),
  activeDays: rows.filter((row) => row.km > 0).length,
});

export const groupByUnit = (rows) => {
  const groups = rows.reduce((acc, row) => ({ ...acc, [row.unitId]: [...(acc[row.unitId] || []), row] }), {});
  return Object.values(groups).map((unitRows) => ({
    unitId: unitRows[0].unitId,
    unitEco: unitRows[0].unitEco,
    unitPlate: unitRows[0].unitPlate,
    driverName: unitRows[0].driverName,
    ...summarize(unitRows),
  }));
};

export const kmByDay = (rows) => {
  const days = rows.reduce((acc, row) => ({ ...acc, [row.date]: (acc[row.date] || 0) + row.km }), {});
  return Object.entries(days).sort(([a], [b]) => a.localeCompare(b));
};

export const formatHours = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  return `${hours} h ${String(rest).padStart(2, '0')} min`;
};

// CSV with a UTF-8 BOM and semicolons so Excel (es-MX) opens accents and columns correctly.
export const downloadCsv = (filename, headers, rows) => {
  const escape = (cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`;
  const content = [headers, ...rows].map((row) => row.map(escape).join(';')).join('\r\n');
  const blob = new Blob(['﻿', content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
