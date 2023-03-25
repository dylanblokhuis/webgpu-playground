import { LoaderArgs, redirect } from "@remix-run/cloudflare";
import { Outlet } from "@remix-run/react";
import SaveDraft from "~/components/SaveDraft";

export function loader(args: LoaderArgs) {
  if (new URL(args.request.url).pathname === "/project" || new URL(args.request.url).pathname === "/project/") {
    return redirect("/project/draft")
  }

  return true;
}

export default function Index() {
  return <>
    <header className="p-4 text-white flex items-center justify-between h-[6%]">
      <span className="font-bold text-lg">🖼️ WebGPU playground</span>

      <SaveDraft />
    </header>

    <main className="h-[94%]">
      <Outlet />
    </main>
  </>
}
