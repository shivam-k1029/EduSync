// CRA dev proxy — picked up automatically on npm start (no restart needed after editing).
// Routes /canvas-api/* and /slack-api/* through the local dev server to avoid CORS.

var { createProxyMiddleware } = require('http-proxy-middleware');

function makeProxy(target) {
  return createProxyMiddleware({
    target: target,
    changeOrigin: true,
    secure: true,
    on: {
      proxyReq: function(proxyReq, req) {
        var auth = req.headers['authorization'];
        if (auth) proxyReq.setHeader('Authorization', auth);
      },
      error: function(err, req, res) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Proxy error: ' + err.message }));
      }
    }
  });
}

module.exports = function(app) {
  // Canvas LMS — strips /canvas-api prefix before forwarding
  app.use('/canvas-api', createProxyMiddleware({
    target: 'https://rishihood.instructure.com',
    changeOrigin: true,
    secure: true,
    pathRewrite: { '^/canvas-api': '' },
    on: {
      proxyReq: function(proxyReq, req) {
        var auth = req.headers['authorization'];
        if (auth) proxyReq.setHeader('Authorization', auth);
      },
      error: function(err, req, res) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Proxy error: ' + err.message }));
      }
    }
  }));

  // Slack API — strips /slack-api prefix before forwarding
  app.use('/slack-api', createProxyMiddleware({
    target: 'https://slack.com',
    changeOrigin: true,
    secure: true,
    pathRewrite: { '^/slack-api': '' },
    on: {
      proxyReq: function(proxyReq, req) {
        var auth = req.headers['authorization'];
        if (auth) proxyReq.setHeader('Authorization', auth);
        // Slack requires content-type for POST; GET calls are fine as-is
      },
      error: function(err, req, res) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Proxy error: ' + err.message }));
      }
    }
  }));
};