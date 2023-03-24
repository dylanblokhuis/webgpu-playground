import type { EntryContext } from "@remix-run/cloudflare";
import { RemixServer } from "@remix-run/react";
import isbot from "isbot";
import { renderToReadableStream } from "react-dom/server";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const body = await renderToReadableStream(
    <RemixServer context={remixContext} url={request.url} />,
    {
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    }
  );

  if (isbot(request.headers.get("user-agent"))) {
    await body.allReady;
  }

  const url = new URL(request.url);
  if (url.hostname === "localhost" && url.port === "3000") {
    responseHeaders.set("Origin-Trial", "Aotk4lKyJjKvozg4JQVI4jGolGC06ZvTfZvwadeZiFeSA0v7WAcM4B5aheEG632PcQTxLQDazEEFfF1k5Sr7agIAAABJeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJmZWF0dXJlIjoiV2ViR1BVIiwiZXhwaXJ5IjoxNjkxNzExOTk5fQ==")
  }
  if (url.hostname === "webgpu.blokhuis.dev") {
    responseHeaders.set("Origin-Trial", "AgXh2KuNX4BFu8re72hcm/HtLKLFUiuBOcFVwBgra7NMFXtnYv3Ue84r8L9+PQyhRUWL7Xcsg4gwxqw17thw9A4AAABTeyJvcmlnaW4iOiJodHRwczovL3dlYmdwdS5ibG9raHVpcy5kZXY6NDQzIiwiZmVhdHVyZSI6IldlYkdQVSIsImV4cGlyeSI6MTY5MTcxMTk5OX0=")
  }

  responseHeaders.set("Content-Type", "text/html");
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
