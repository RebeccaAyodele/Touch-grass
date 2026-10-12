import type { AddressInfo } from 'node:net';

const requestCount = Number(process.env.LOAD_TEST_REQUESTS ?? 350);
const concurrency = Number(process.env.LOAD_TEST_CONCURRENCY ?? 25);

if (!Number.isInteger(requestCount) || requestCount < 1 || requestCount > 5000) {
  throw new Error('LOAD_TEST_REQUESTS must be an integer from 1 to 5000.');
}
if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 100) {
  throw new Error('LOAD_TEST_CONCURRENCY must be an integer from 1 to 100.');
}

const { app } = await import('../src/app.js');
const server = app.listen(0, '127.0.0.1');

try {
  await new Promise<void>((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });

  const address = server.address() as AddressInfo;
  const url = `http://127.0.0.1:${address.port}/api/v1/health/live`;
  const statuses: Record<number, number> = {};
  const durations: number[] = [];
  let nextIndex = 0;
  let networkErrors = 0;
  const startedAt = performance.now();

  await Promise.all(Array.from({ length: Math.min(concurrency, requestCount) }, async () => {
    while (true) {
      const index = nextIndex++;
      if (index >= requestCount) return;
      const requestStartedAt = performance.now();
      try {
        const response = await fetch(url);
        await response.arrayBuffer();
        statuses[response.status] = (statuses[response.status] ?? 0) + 1;
        durations.push(performance.now() - requestStartedAt);
      } catch {
        networkErrors++;
      }
    }
  }));

  const elapsedMs = performance.now() - startedAt;
  durations.sort((a, b) => a - b);
  const p95Index = Math.max(0, Math.ceil(durations.length * 0.95) - 1);
  const serverErrors = Object.entries(statuses)
    .filter(([status]) => Number(status) >= 500)
    .reduce((sum, [, count]) => sum + count, 0);
  const rateLimited = statuses[429] ?? 0;

  console.log('Local API liveness load test (no database or AI requests)');
  console.log(`Requests: ${requestCount}; concurrency: ${concurrency}`);
  console.log(`Duration: ${elapsedMs.toFixed(0)} ms; throughput: ${(requestCount / (elapsedMs / 1000)).toFixed(1)} req/s`);
  console.log(`HTTP 200: ${statuses[200] ?? 0}; HTTP 429: ${rateLimited}; HTTP 5xx: ${serverErrors}; network errors: ${networkErrors}`);
  console.log(`Latency p95: ${durations[p95Index]?.toFixed(1) ?? 'n/a'} ms`);

  if (serverErrors > 0 || networkErrors > 0 || (statuses[200] ?? 0) + rateLimited !== requestCount) {
    process.exitCode = 1;
  }
} finally {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}
