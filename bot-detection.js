// bot-detection.js
const express = require('express');
const app = express();
const PORT = 3001;

// in-memory store for request times
const requestTimes = {};

app.use((req, res, next) => {
  console.log(`Request received from ${req.ip} with User-Agent: ${req.headers['user-agent']}`);
  
  // check for suspicious user agent
  const userAgent = req.headers['user-agent'] || '';
  if (!userAgent || userAgent.length < 20) {
    console.log('bot detected');
    return res.status(403).send('access denied: bot detected');
  }
  
  // check for consistent timing patterns
  const clientIP = req.ip;
  const now = Date.now();
  requestTimes[clientIP] = requestTimes[clientIP] || [];
  requestTimes[clientIP].push(now);
  
  // keep recent requests
  const recentRequests = requestTimes[clientIP].filter(time => now - time < 60 * 1000);
  requestTimes[clientIP] = recentRequests;
  
  // if we have several requests, check timing patterns
  if (recentRequests.length > 3) {
    const timeDiffs = [];
    for (let i = 1; i < recentRequests.length; i++) {
      timeDiffs.push(recentRequests[i] - recentRequests[i-1]);
    }
    
    // check for suspiciously consistent timing
    const avgDiff = timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length;
    const isConsistent = timeDiffs.every(diff => Math.abs(diff - avgDiff) < 100);
    
    if (isConsistent && timeDiffs.length >= 3) {
      console.log('Bot detected: too consistent request timing');
      return res.status(403).send('access denied: bot behavior detected');
    }
  }
  
  // request is allowed
  res.status(200).send('hello, human');
});

app.listen(PORT, () => {
  console.log(`bot detection running on port ${PORT}`);
});