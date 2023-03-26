import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import stylesheet from "~/tailwind.css";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "WebGPU playground",
  viewport: "width=device-width,initial-scale=1",
});

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "icon", href: "/favicon.svg" },
];


export default function App() {
  return (
    <html className="w-full h-full" lang="en">
      <head>
        <Meta />
        <Links />

      </head>
      <body className="w-full bg-slate-900 h-screen flex flex-col">
        <header className="p-4 text-white flex items-center justify-between h-[6%] container mx-auto">
          <NavLink to="/" className="font-bold text-lg">🖼️ WebGPU playground</NavLink>
        </header>

        <main className="h-[94%]">
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
