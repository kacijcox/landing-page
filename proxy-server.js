const express = require('express');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;
const TARGET_URL = 'https://kacicox.com'; 

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  message: 'Too many requests, friend!'
});


app.use(limiter);

app.use('/', createProxyMiddleware({
  target: TARGET_URL,
  changeOrigin: true,
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Request: ${req.method} ${req.path} - Status: ${proxyRes.statusCode}`);
  }
}));

app.listen(PORT, () => {
  console.log(`Security proxy running on port ${PORT}`);
  console.log(`Proxying requests to: ${TARGET_URL}`);
});