// Mira Product Finder: starter API endpoint.
// This confirms requests reach Cloudflare; live web search is NOT connected yet.
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': 'https://tabithajebarker-droid.github.io',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
    }

    const query = (url.searchParams.get('q') || '').trim().slice(0, 120);
    if (!query) {
      return new Response(JSON.stringify({
        status: 'ready',
        service: 'Mira Product Finder',
        message: 'Add ?q=part-number to test a search request.'
      }), { headers });
    }

    return new Response(JSON.stringify({
      status: 'complete',
      query,
      results: [],
      searchPerformed: false,
      message: 'Request received. Live internet search is not connected yet.'
    }), { headers });
  }
};

