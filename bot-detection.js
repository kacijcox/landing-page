// bot-detection.js
const requestTimes = {};

export default function middleware(request) {
  console.log('bot detection middleware executed for path:', request.nextUrl.pathname);
  
  // Get the client IP
  const clientIP = request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown';
  
  // check for suspicious user agent
  const userAgent = request.headers.get('user-agent') || '';
  if (!userAgent || userAgent.length < 20) {
    console.log('bot detected: suspicious user agent');
    return new Response('access denied: bot detected', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
  
  // 2. check for bot patterns in user agent
  const botPatterns = [
    /bot/i, /crawl/i, /spider/i, /headless/i, /scrape/i, 
    /phantom/i, /selenium/i, /puppeteer/i
  ];
  
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    // allow legitimate bots
    if (!/googlebot|bingbot|yandexbot/i.test(userAgent)) {
      console.log('bot detected: bot pattern in user agent');
      return new Response('access denied: bot detected', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }
  }
  
  // check for consistent timing patterns
  const now = Date.now();
  requestTimes[clientIP] = requestTimes[clientIP] || [];
  requestTimes[clientIP].push(now);
  
  // keep only recent requests
  const recentRequests = requestTimes[clientIP].filter(time => now - time < 60 * 1000);
  requestTimes[clientIP] = recentRequests;
  
  // check timing patterns
  if (recentRequests.length > 3) {
    const timeDiffs = [];
    for (let i = 1; i < recentRequests.length; i++) {
      timeDiffs.push(recentRequests[i] - recentRequests[i-1]);
    }
    
    // check for suspiciously consistent timing
    const avgDiff = timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length;
    const isConsistent = timeDiffs.every(diff => Math.abs(diff - avgDiff) < 100);
    
    if (isConsistent && timeDiffs.length >= 3) {
      console.log('bot detected: too consistent request timing');
      return new Response('access denied: bot behavior detected', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }
  }
  
  // request is allowed
  return Response.next();
}

// configure paths
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)'
  ]
};