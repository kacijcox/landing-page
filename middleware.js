// middleware.js
ipRequestCounts = {};
const requestTimes = {};
const windowMs = 60 * 1000; // 1 minute window
const maxRequests = 15; // maximum requests per minute per IP

// helper function to get client IP
function getIP(request) {
  return request.headers.get('x-forwarded-for') || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

export default function middleware(request) {
  console.log('Security middleware executed for path:', request.nextUrl.pathname);
  
  // get the client IP
  const clientIP = getIP(request);
  const now = Date.now();
  
  // === BOT DETECTION LOGIC ===
  // check for suspicious user agent
  const userAgent = request.headers.get('user-agent') || '';
  
  // only block if user agent is missing entirely
  if (!userAgent) {
    console.log('bot detected: missing user agent');
    return new Response('access denied: bot detected', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
  
  // check for specific bot patterns in user agent
  const obviousBotPatterns = [
    /^bot\b/i, 
    /^crawl\b/i, 
    /^spider\b/i, 
    /\bscraper\b/i,
    /^curl\//i,
    /^python-requests/i,
    /^scrapebot/i,
    /^wget/i,
    /^postman/i
  ];
  
  if (obviousBotPatterns.some(pattern => pattern.test(userAgent))) {
    // still allow legitimate bots like google
    if (!/googlebot|bingbot|yandexbot/i.test(userAgent)) {
      console.log('Bot detected: Obvious bot pattern in user agent');
      return new Response('access denied: bot detected', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }
  }
  
  // === RATE LIMITING LOGIC ===
  // initialize or clean old requests for this IP
  ipRequestCounts[clientIP] = ipRequestCounts[clientIP] || [];
  ipRequestCounts[clientIP] = ipRequestCounts[clientIP].filter(
    timestamp => now - timestamp < windowMs
  );
  
  // count requests in the current time window
  const requestCount = ipRequestCounts[clientIP].length;
  
  // if too many requests, return 429
  if (requestCount >= maxRequests) {
    return new Response('too many requests', {
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