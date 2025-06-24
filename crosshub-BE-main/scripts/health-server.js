const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.HEALTH_PORT || 3001;
const LOG_DIR = path.join(__dirname, '..', 'logs');

// 헬스체크 서버
const server = http.createServer((req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    try {
      // 로그 파일 존재 여부 확인 (트랜잭션 생성기가 정상 작동하는지 확인)
      const today = new Date().toISOString().split('T')[0];
      const logFile = path.join(LOG_DIR, `transaction-generator-${today}.log`);

      const isHealthy = fs.existsSync(logFile);

      if (isHealthy) {
        // 최근 로그 확인 (최근 1시간 내 활동이 있는지)
        const stats = fs.statSync(logFile);
        const lastModified = new Date(stats.mtime);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        if (lastModified > oneHourAgo) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              status: 'healthy',
              timestamp: new Date().toISOString(),
              lastActivity: lastModified.toISOString(),
              message: 'Transaction generator is running',
            }),
          );
        } else {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              status: 'unhealthy',
              timestamp: new Date().toISOString(),
              lastActivity: lastModified.toISOString(),
              message: 'No recent activity detected',
            }),
          );
        }
      } else {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            message: 'Log file not found',
          }),
        );
      }
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          status: 'error',
          timestamp: new Date().toISOString(),
          message: error.message,
        }),
      );
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'not found',
        message: 'Health check endpoint: GET /health',
      }),
    );
  }
});

server.listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
});

// 프로세스 종료 처리
process.on('SIGTERM', () => {
  console.log('Health server shutting down...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Health server shutting down...');
  server.close(() => {
    process.exit(0);
  });
});
