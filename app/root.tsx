import { LinksFunction, LoaderArgs, MetaFunction, V2_MetaFunction, json } from "@remix-run/cloudflare";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { Loader } from "esbuild-wasm";
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

  console.log(user)
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
            <div>
              {user.name}
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
