/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/cloudflare" />
/// <reference types="@cloudflare/workers-types" />
/// <reference types="@webgpu/types" />

import type { DataFunctionArgs } from "@remix-run/cloudflare";
declare module "@remix-run/cloudflare" {
  export interface LoaderArgs extends DataFunctionArgs {
    context: { DB: D1Database, SESSION_SECRET: string };
  }

  export interface ActionArgs extends DataFunctionArgs {
    context: { DB: D1Database, SESSION_SECRET: string };
  }
}