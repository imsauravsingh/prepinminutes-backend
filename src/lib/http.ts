/**
 * Lightweight Web Fetch Request/Response compatibility layer for Cloudflare Workers & Node tests.
 */

export class ApiRequest extends Request {
  public readonly nextUrl: URL;

  constructor(input: RequestInfo | URL, init?: RequestInit) {
    super(input, init);
    this.nextUrl = new URL(this.url);
  }

  static from(req: Request): ApiRequest {
    if (req instanceof ApiRequest) return req;
    return Object.assign(req, { nextUrl: new URL(req.url) }) as ApiRequest;
  }
}

export const ApiResponse = {
  json<T>(body: T, init?: ResponseInit): Response {
    const headers = new Headers(init?.headers);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json; charset=utf-8");
    }
    return new Response(JSON.stringify(body), {
      ...init,
      status: init?.status ?? 200,
      headers,
    });
  },
};
