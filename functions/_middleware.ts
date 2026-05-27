export const onRequest: PagesFunction = async (context) => {
  const request = context.request;
  
  // Cloudflare automatically injects the user's country code into the cf object
  const country = request.cf?.country as string;

  // List of ISO 3166-1 alpha-2 country codes to block
  // PH: Philippines, CN: China
  // Embargoed/High-Risk: CU (Cuba), IR (Iran), KP (North Korea), SY (Syria), RU (Russia), BY (Belarus)
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

  // Continue to the requested page if not blocked
  return await context.next();
};
