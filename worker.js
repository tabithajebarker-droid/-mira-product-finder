
export default {
  async fetch(request, env) {
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "https://tabithajebarker-droid.github.io",
      "Access-Control-Allow-Methods": "GET, OPTIONS"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    const url = new URL(request.url);
    const query = (url.searchParams.get("q") || "").trim();

    if (!query) {
      return Response.json({
        status: "ready",
        service: "Mira Product Finder",
        database: "D1"
      }, { headers });
    }

    try {
      const search = `%${query.replace(/[%_\\]/g, "\\$&")}%`;

      const { results } = await env.DB.prepare(`
        SELECT id, name, model_number,
               product_family, version,
               status, description
        FROM products
        WHERE name LIKE ? ESCAPE '\\'
           OR model_number LIKE ? ESCAPE '\\'
           OR product_family LIKE ? ESCAPE '\\'
        LIMIT 25
      `).bind(search, search, search).all();

      return Response.json({
        status: "complete",
        query,
        results,
        source: "Mira Product Database"
      }, { headers });

    } catch (error) {
      return Response.json({
        status: "error",
        message: "Database search failed"
      }, {
        status: 500,
        headers
      });
    }
  }
};
