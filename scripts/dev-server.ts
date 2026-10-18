import "dotenv/config";
import http from "node:http";
import worker from "../src/index";

const PORT = Number(process.env.PORT) || 8787;

const server = http.createServer(async (req, res) => {
  const origin = `http://${req.headers.host || `localhost:${PORT}`}`;
  const url = new URL(req.url || "/", origin);

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const body = ["GET", "HEAD"].includes(req.method?.toUpperCase() || "")
    ? undefined
    : Buffer.concat(chunks);

  const webReq = new Request(url.toString(), {
    method: req.method,
    headers: req.headers as Record<string, string>,
    body,
  });

  try {
    const webRes = await worker.fetch(webReq, process.env as any);

    const headers: Record<string, string | string[]> = {};
    for (const [key, value] of webRes.headers.entries()) {
      if (key.toLowerCase() !== "set-cookie") {
        headers[key] = value;
      }
    }
    // Handle multiple Set-Cookie headers properly
    const cookies = typeof webRes.headers.getSetCookie === "function" ? webRes.headers.getSetCookie() : [];
    if (cookies.length > 0) {
      headers["set-cookie"] = cookies;
    } else {
      const singleCookie = webRes.headers.get("set-cookie");
      if (singleCookie) headers["set-cookie"] = singleCookie;
    }

    res.writeHead(webRes.status, headers);
    const arrayBuffer = await webRes.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));
  } catch (err: any) {
    console.error("Local dev server error:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "INTERNAL_SERVER_ERROR", message: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`  🚀 PrepInMinutes Local Dev Gateway Running     `);
  console.log(`  📡 URL: http://localhost:${PORT}             `);
  console.log(`  🐘 Database: Local PostgreSQL (localhost:5432)   `);
  console.log(`==================================================\n`);
});

