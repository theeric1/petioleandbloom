export const onRequest: PagesFunction = async (context) => {
  const request = context.request;
  const url = new URL(request.url);
  const pathname = url.pathname.toLowerCase();
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();

  // Always allow search engine crawlers, AI bots, and social media preview bots
  const isSearchCrawler = userAgent.includes('googlebot') ||
                          userAgent.includes('bingbot') ||
                          userAgent.includes('slurp') ||
                          userAgent.includes('duckduckbot') ||
                          userAgent.includes('baiduspider') ||
                          userAgent.includes('yandexbot') ||
                          userAgent.includes('applebot') ||
                          userAgent.includes('gptbot') ||
                          userAgent.includes('claudebot') ||
                          userAgent.includes('perplexitybot') ||
                          userAgent.includes('facebookexternalhit') ||
                          userAgent.includes('twitterbot') ||
                          userAgent.includes('linkedinbot');

  const isStaticAsset = pathname.endsWith('.xml') ||
                        pathname.endsWith('.txt') ||
                        pathname.endsWith('.svg') ||
                        pathname.endsWith('.jpg') ||
                        pathname.endsWith('.png') ||
                        pathname.endsWith('.webp') ||
                        pathname.endsWith('.ico') ||
                        pathname.endsWith('.js') ||
                        pathname.endsWith('.css') ||
                        pathname.endsWith('.json') ||
                        pathname.startsWith('/images/') ||
                        pathname.startsWith('/assets/');

  if (isSearchCrawler || isStaticAsset) {
    const response = await context.next();
    const newHeaders = new Headers(response.headers);

    // Enforce no-store on HTML and XML so crawlers never receive stale CDN cached versions
    if (!isStaticAsset || pathname.endsWith('sitemap.xml')) {
      newHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      newHeaders.set('CDN-Cache-Control', 'no-store');
      newHeaders.set('Cloudflare-CDN-Cache-Control', 'no-store');
      newHeaders.set('Surrogate-Control', 'no-store');
      newHeaders.set('Pragma', 'no-cache');
      newHeaders.set('X-Robots-Tag', 'all');
    }

    // Explicitly enforce XML MIME type on sitemaps
    if (pathname.endsWith('sitemap.xml')) {
      newHeaders.set('Content-Type', 'application/xml; charset=utf-8');
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }

  // Cloudflare automatically injects the user's country code into the cf object
  const country = request.cf?.country as string;

  // List of ISO 3166-1 alpha-2 country codes to block
  const blockedCountries = ['PH', 'CN', 'CU', 'IR', 'KP', 'SY', 'RU', 'BY'];

  if (country && blockedCountries.includes(country)) {
    return new Response('Access Denied: This website is not available in your region.', {
      status: 403,
      statusText: 'Forbidden',
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  // SPA fallback for section & product routes
  const response = await context.next();
  const newHeaders = new Headers(response.headers);
  newHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  newHeaders.set('CDN-Cache-Control', 'no-store');
  newHeaders.set('Cloudflare-CDN-Cache-Control', 'no-store');
  newHeaders.set('Surrogate-Control', 'no-store');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
};
