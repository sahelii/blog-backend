/**
 * Quick test script to verify backend works locally
 * Run: node test-deploy.js
 */

const app = require('./app');
const http = require('http');

const server = http.createServer(app);
const PORT = 5000;

server.listen(PORT, async () => {
  console.log(`✅ Server started on port ${PORT}`);
  
  // Test health endpoint
  http.get(`http://localhost:${PORT}/health`, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('✅ Health endpoint:', data);
      // Test metrics
      http.get(`http://localhost:${PORT}/metrics`, (res2) => {
        let data2 = '';
        res2.on('data', (chunk) => { data2 += chunk; });
        res2.on('end', () => {
          console.log('✅ Metrics endpoint:', data2);
          // Test posts
          http.get(`http://localhost:${PORT}/api/posts?page=1&limit=5`, (res3) => {
            let data3 = '';
            res3.on('data', (chunk) => { data3 += chunk; });
            res3.on('end', () => {
              const parsed = JSON.parse(data3);
              console.log('✅ Posts endpoint:', parsed.success ? 'OK' : 'Failed');
              console.log('\n✅ All tests passed! If these work locally but not on Render, check:');
              console.log('   1. Render logs for startup errors');
              console.log('   2. Environment variables (MONGO_URI, CORS_ALLOWED_ORIGINS)');
              console.log('   3. Render service is "Live" (not sleeping)');
              server.close();
              process.exit(0);
            });
          }).on('error', (err) => {
            console.error('❌ Posts endpoint failed:', err.message);
            server.close();
            process.exit(1);
          });
        });
      }).on('error', (err) => {
        console.error('❌ Metrics endpoint failed:', err.message);
        server.close();
        process.exit(1);
      });
    });
  }).on('error', (err) => {
    console.error('❌ Health endpoint failed:', err.message);
    server.close();
    process.exit(1);
  });
  
  console.log('\n✅ All tests passed! If these work locally but not on Render, check:');
  console.log('   1. Render logs for startup errors');
  console.log('   2. Environment variables (MONGO_URI, CORS_ALLOWED_ORIGINS)');
  console.log('   3. Render service is "Live" (not sleeping)');
  
  server.close();
  process.exit(0);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err.message);
  process.exit(1);
});
