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
    // Explicitly enforce XML MIME type on sitemaps
    if (pathname.endsWith('sitemap.xml')) {
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Content-Type', 'application/xml; charset=utf-8');
      newHeaders.set('X-Robots-Tag', 'all');
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }
    return response;
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

  // SPA fallback: for section & product routes, try serving pre-rendered HTML first.
  // If no static file exists at that path, Cloudflare Pages serves the root index.html
  // automatically via the _redirects file. Crawlers get pre-rendered pages; users get SPA.
  return await context.next();
};
