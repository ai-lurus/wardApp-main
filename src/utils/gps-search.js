// Unit search for the fleet map: matches driver name, economic number and plate,
// ignoring case, accents, dashes and spaces (so "ECO123" finds "ECO-123").

export const normalizeSearch = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const searchableFields = (unit) => [unit.eco, unit.plate, unit.driver?.name];

export const unitMatches = (unit, query) => {
  const needle = normalizeSearch(query);
  if (!needle) return true;
  return searchableFields(unit).some((field) => normalizeSearch(field).includes(needle));
};

export const unitSearchLabel = (unit) => `${unit.eco} · ${unit.plate} · ${unit.driver?.name || 'Sin operador'}`;
