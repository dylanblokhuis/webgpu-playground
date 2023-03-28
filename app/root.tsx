import { LinksFunction, LoaderArgs, V2_MetaFunction, json } from "@remix-run/cloudflare";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import stylesheet from "~/tailwind.css";
import { getUser } from "./services/session.server";

export const meta: V2_MetaFunction = () => ([{
  charset: "utf-8",
  title: "WebGPU playground",
  viewport: "width=device-width,initial-scale=1",
}]);

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "icon", href: "/favicon.svg" },
];

export async function loader({ request }: LoaderArgs) {
  const user = await getUser(request);
  return json({ user })
}

export default function App() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <html className="w-full h-full" lang="en">
      <head>
        <Meta />
        <Links />

      </head>
      <body className="w-full bg-slate-900 h-screen flex flex-col">
        <header className="p-4 text-white flex items-center justify-between h-[6%] container mx-auto">
          <a href="/" className="font-bold text-lg">🖼️ WebGPU playground</a>

          {user && (
            <div className="flex items-center gap-x-2">
              <span>{user.name}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          )}
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
