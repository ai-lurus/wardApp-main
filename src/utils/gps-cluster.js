// Greedy distance clustering for map markers. Items need x/y in the same units as `radius`.
export const clusterPoints = (items, radius) =>
  items.reduce((clusters, item) => {
    const index = clusters.findIndex((cluster) => Math.hypot(cluster.x - item.x, cluster.y - item.y) <= radius);
    if (index === -1) return [...clusters, { x: item.x, y: item.y, items: [item] }];
    const cluster = clusters[index];
    const count = cluster.items.length;
    const merged = {
      x: (cluster.x * count + item.x) / (count + 1),
      y: (cluster.y * count + item.y) / (count + 1),
      items: [...cluster.items, item],
    };
    return clusters.map((current, i) => (i === index ? merged : current));
  }, []);

// Status with the most units in a cluster; ties go to the first status in `order`.
export const dominantStatus = (items, order) => {
  const counts = items.reduce((acc, item) => ({ ...acc, [item.status]: (acc[item.status] || 0) + 1 }), {});
  return order.reduce((best, status) => ((counts[status] || 0) > (counts[best] || 0) ? status : best), order[0]);
};
