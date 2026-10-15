// Share-tracking tokens for the GPS demo. The token carries only the trip id, options and
// expiry (no names, plates or phones), base64url-encoded so the public page needs no backend.

export const TRACKING_VALIDITY = {
  '24h': { label: '24 horas', hours: 24 },
  '72h': { label: '72 horas', hours: 72 },
  delivery: { label: 'Hasta la entrega', hours: null },
};

const toBase64Url = (text) => window.btoa(unescape(encodeURIComponent(text))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromBase64Url = (token) => {
  const padded = token.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(token.length / 4) * 4, '=');
  return decodeURIComponent(escape(window.atob(padded)));
};

export const createTrackingToken = ({ tripId, showEta, showDriver, validity }) => {
  const { hours } = TRACKING_VALIDITY[validity];
  const payload = {
    v: 1,
    t: tripId,
    e: showEta ? 1 : 0,
    d: showDriver ? 1 : 0,
    x: hours ? Date.now() + hours * 3600 * 1000 : null,
  };
  return toBase64Url(JSON.stringify(payload));
};

// Returns { tripId, showEta, showDriver, expiresAt } or null when the token is malformed.
export const readTrackingToken = (token) => {
  try {
    const payload = JSON.parse(fromBase64Url(String(token || '')));
    if (payload.v !== 1 || typeof payload.t !== 'string') return null;
    return { tripId: payload.t, showEta: Boolean(payload.e), showDriver: Boolean(payload.d), expiresAt: payload.x };
  } catch (err) {
    return null;
  }
};

// "47-AK-3T" → "47-AK-•••": enough to recognize the truck, not the full plate.
export const maskPlate = (plate = '') => plate.replace(/[A-Z0-9]+$/i, '•••');
