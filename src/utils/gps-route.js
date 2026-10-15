// Geometry helpers for the GPS demo module.
// Coordinates are [lat, lng] pairs in decimal degrees.

const EARTH_RADIUS_KM = 6371;

const toRad = (deg) => (deg * Math.PI) / 180;
const toDeg = (rad) => (rad * 180) / Math.PI;

export const haversineKm = ([lat1, lng1], [lat2, lng2]) => {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
};

// Cumulative distances (km) for each point of a polyline.
export const cumulativeKm = (points) => {
  const result = [0];
  for (let i = 1; i < points.length; i += 1) {
    result.push(result[i - 1] + haversineKm(points[i - 1], points[i]));
  }
  return result;
};

export const routeLengthKm = (points) => {
  const cumulative = cumulativeKm(points);
  return cumulative[cumulative.length - 1];
};

export const bearingDeg = ([lat1, lng1], [lat2, lng2]) => {
  const y = Math.sin(toRad(lng2 - lng1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lng2 - lng1));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
};

// Position along a polyline for a progress value between 0 and 1.
// Returns the interpolated point, heading and the index of the segment it is on.
export const pointAlongRoute = (points, progress) => {
  const cumulative = cumulativeKm(points);
  const total = cumulative[cumulative.length - 1];
  const target = Math.min(Math.max(progress, 0), 1) * total;

  for (let i = 1; i < points.length; i += 1) {
    if (cumulative[i] >= target) {
      const segmentLength = cumulative[i] - cumulative[i - 1] || 1;
      const t = (target - cumulative[i - 1]) / segmentLength;
      const [lat1, lng1] = points[i - 1];
      const [lat2, lng2] = points[i];
      return {
        position: [lat1 + (lat2 - lat1) * t, lng1 + (lng2 - lng1) * t],
        heading: bearingDeg(points[i - 1], points[i]),
        segmentIndex: i - 1,
      };
    }
  }

  return {
    position: points[points.length - 1],
    heading: bearingDeg(points[points.length - 2], points[points.length - 1]),
    segmentIndex: points.length - 2,
  };
};

// Portion of the route already travelled, ending at the current position.
export const travelledPath = (points, progress) => {
  const { position, segmentIndex } = pointAlongRoute(points, progress);
  return [...points.slice(0, segmentIndex + 1), position];
};

// Bounding box of a set of points with padding (degrees).
export const boundsOf = (points, padding = 0.6) => {
  const lats = points.map((p) => p[0]);
  const lngs = points.map((p) => p[1]);
  return {
    minLat: Math.min(...lats) - padding,
    maxLat: Math.max(...lats) + padding,
    minLng: Math.min(...lngs) - padding,
    maxLng: Math.max(...lngs) + padding,
  };
};

// Grows the shorter side of a bounding box so it matches a width/height ratio,
// keeping the box centered. Avoids tiny markers when a route is long and narrow.
export const fitBoundsToAspect = (bounds, aspectRatio) => {
  const midLat = toRad((bounds.minLat + bounds.maxLat) / 2);
  const kx = Math.cos(midLat);
  const spanX = (bounds.maxLng - bounds.minLng) * kx;
  const spanY = bounds.maxLat - bounds.minLat;
  const centerLat = (bounds.minLat + bounds.maxLat) / 2;
  const centerLng = (bounds.minLng + bounds.maxLng) / 2;

  if (spanX / spanY < aspectRatio) {
    const halfLng = (spanY * aspectRatio) / kx / 2;
    return { ...bounds, minLng: centerLng - halfLng, maxLng: centerLng + halfLng };
  }
  const halfLat = spanX / aspectRatio / 2;
  return { ...bounds, minLat: centerLat - halfLat, maxLat: centerLat + halfLat };
};

// Simple equirectangular projection into an SVG viewport.
// Longitude is scaled by cos(latitude) so shapes are not stretched.
export const createProjection = (bounds, width) => {
  const midLat = toRad((bounds.minLat + bounds.maxLat) / 2);
  const kx = Math.cos(midLat);
  const spanX = (bounds.maxLng - bounds.minLng) * kx;
  const spanY = bounds.maxLat - bounds.minLat;
  const scale = width / spanX;
  const height = spanY * scale;

  const project = ([lat, lng]) => [
    (lng - bounds.minLng) * kx * scale,
    (bounds.maxLat - lat) * scale,
  ];

  // Inverse of project: SVG coordinates back to [lat, lng].
  const unproject = ([x, y]) => [bounds.maxLat - y / scale, bounds.minLng + x / (kx * scale)];

  return { project, unproject, width, height, scale };
};

export const toSvgPath = (points, project) =>
  points
    .map((point, i) => {
      const [x, y] = project(point);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

// Progress (0..1) of a route vertex, measured by distance from the origin.
export const progressAtIndex = (points, index) => {
  const cumulative = cumulativeKm(points);
  return cumulative[index] / cumulative[cumulative.length - 1];
};
