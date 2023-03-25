import { LoaderArgs } from "@remix-run/cloudflare";

let context: LoaderArgs["context"];

export function setContext(ctx: LoaderArgs["context"]) {
  console.log(ctx);
  context = ctx;
}
export function requireContext() {
  if (!context) throw new Error("Context not set");
  return context;
}