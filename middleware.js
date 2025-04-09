// middleware.js

function getIP(request) {
    return request.headers.get('x-forwarded-for') || 
           request.headers.get('x-real-ip') || 
           'unknown';
  }
  
  const ipRequestCounts = {};
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 50; // Maximum requests per minute per IP
  
  export default function middleware(request) {
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
    
    // Otherwise, record this request and proceed
    ipRequestCounts[clientIP].push(now);
    
    // Continue to the next middleware or to the requested resource
    return Response.next();
  }
  
  // Configure which paths this middleware should run on
  export const config = {
    matcher: [
      // Apply to all paths except static files, images, etc.
      '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)'
    ]
  };