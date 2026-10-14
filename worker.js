
export default {
  async fetch(request, env) {
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin":
        "https://tabithajebarker-droid.github.io",
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
        database: "D1",
        search: ["products", "spare_parts"]
      }, { headers });
    }

    if (query.length > 100) {
      return Response.json({
        status: "error",
        message: "Search query is too long"
      }, { status: 400, headers });
    }

    try {
      const pattern = `%${query.replace(
        /[%_\\]/g, "\\$&"
      )}%`;

      // Search shower products
      const products = await env.DB.prepare(`
        SELECT id, name, model_number,
               product_family, version,
               status, description
        FROM products
        WHERE name LIKE ? ESCAPE '\\'
           OR model_number LIKE ? ESCAPE '\\'
           OR product_family LIKE ? ESCAPE '\\'
        LIMIT 25
      `).bind(pattern, pattern, pattern).all();

      // Search spare parts and their compatible showers
      const spares = await env.DB.prepare(`
        SELECT
          s.id,
          s.part_number,
          s.name,
          s.description,
          s.status,
          s.replacement_part_number,
          p.name AS compatible_product,
          p.model_number AS compatible_model
        FROM spare_parts s
        LEFT JOIN product_spares ps
          ON ps.spare_id = s.id
        LEFT JOIN products p
          ON p.id = ps.product_id
        WHERE s.part_number LIKE ? ESCAPE '\\'
           OR s.name LIKE ? ESCAPE '\\'
        LIMIT 50
      `).bind(pattern, pattern).all();

      return Response.json({
        status: "complete",
        query,
        results: products.results,
        spares: spares.results,
        source: "Mira Product Database"
      }, { headers });

    } catch (error) {
      return Response.json({
        status: "error",
        message: "Database search failed"
      }, { status: 500, headers });
    }
  }
};
