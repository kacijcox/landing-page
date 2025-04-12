// middleware.js

const ipRequestCounts = {};
const requestTimes = {};
const windowMs = 60 * 1000; // 1 minute window
const maxRequests = 15; // max requests per minute per IP

// helper function to get client IP
function getIP(request) {
  return request.headers.get('x-forwarded-for') || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

export default function middleware(request) {
  console.log('security middleware executed for path:', request.nextUrl.pathname);
  
  // get the client IP
  const clientIP = getIP(request);
  const now = Date.now();
  
  // === BOT DETECTION LOGIC ===
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
  
  // check for bot patterns in user agent
  const botPatterns = [
    /^bot/i, /^crawl/i, /^spider/i, /scrape/i, 
    /phantom/i, /selenium/i, /puppeteer/i
  ];
  
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    // allow legitimate bots like google
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
  requestTimes[clientIP] = requestTimes[clientIP] || [];
  requestTimes[clientIP].push(now);
  
  // keep only recent requests
  const recentRequests = requestTimes[clientIP].filter(time => now - time < windowMs);
  requestTimes[clientIP] = recentRequests;
  
  // === RATE LIMITING LOGIC ===
  // initialize or clean old requests for this IP
  ipRequestCounts[clientIP] = ipRequestCounts[clientIP] || [];
  ipRequestCounts[clientIP] = ipRequestCounts[clientIP].filter(
    timestamp => now - timestamp < windowMs
  );
  
  // count requests in the current time window
  const requestCount = ipRequestCounts[clientIP].length;
  
  // if too many requests, return 429 too many requests
  if (requestCount >= maxRequests) {
    return new Response('too Many Requests', {
      status: 429,
      headers: {
        'Content-Type': 'text/plain',
        'Retry-After': '60'
      }
    });
  }
  
  // otherwise, record this request and proceed
  ipRequestCounts[clientIP].push(now);
  
  // continue to the next middleware or to the requested resource
  return Response.next();
}

// configure which paths this middleware should run on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)'
  ]
};