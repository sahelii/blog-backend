const startTime = Date.now();

const counters = {
  requestsTotal: 0,
  cacheHits: 0,
  cacheMisses: 0,
};

function incrementRequests() {
  counters.requestsTotal += 1;
}

function incrementCacheHit() {
  counters.cacheHits += 1;
}

function incrementCacheMiss() {
  counters.cacheMisses += 1;
}

function getMetrics() {
  return {
    ...counters,
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
  };
}

module.exports = {
  incrementRequests,
  incrementCacheHit,
  incrementCacheMiss,
  getMetrics,
};
