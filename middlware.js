// middleware.js
function getIP(request) {
    return request.headers.get('x-forwarded-for') ||
           request.headers.get('x-real-ip') ||
           'unknown';
  }
  
  const ipRequestCounts = {};
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 15; // Maximum requests per minute per IP
  
  export default function middleware(request) {
    // Log for debugging
    console.log('Middleware executed for path:', request.nextUrl.pathname);
    
    // Get the client IP
    const clientIP = getIP(request);
    const now = Date.now();
   
    // Initialize or clean old requests for this IP
    ipRequestCounts[clientIP] = ipRequestCounts[clientIP] || [];
    ipRequestCounts[clientIP] = ipRequestCounts[clientIP].filter(
      timestamp => now - timestamp < windowMs
    );
   
    // Count requests in the current time window
    const requestCount = ipRequestCounts[clientIP].length;
   
    // If too many requests, return 429 Too Many Requests
    if (requestCount >= maxRequests) {
      return new Response('Too Many Requests', {
        status: 429,
        headers: {
          'Content-Type': 'text/plain',
          'Retry-After': '60'
        }
      });
    }
   
    ipRequestCounts[clientIP].push(now);
   
    return Response.next();
  }
  
  export const config = {
    matcher: [
      '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)'
    ]
  };