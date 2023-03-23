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
  if (url.hostname === "webgpu-playground.blokys.workers.dev") {
    responseHeaders.set("Origin-Trial", "AtcPhDMQ7C8uPueyiBrbRuK+lFtlYLkmKjzFxr0/4fR/vVCm/VU9aeV9fqW608NMenrJ+RtpfjL2BsOW6yk5EgIAAABkeyJvcmlnaW4iOiJodHRwczovL3dlYmdwdS1wbGF5Z3JvdW5kLmJsb2t5cy53b3JrZXJzLmRldjo0NDMiLCJmZWF0dXJlIjoiV2ViR1BVIiwiZXhwaXJ5IjoxNjkxNzExOTk5fQ==")
  }

  responseHeaders.set("Content-Type", "text/html");
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
