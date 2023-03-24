import { Link } from "@remix-run/react";
import { ClientOnly } from "remix-utils";
import Canvas from "~/components/Canvas.client";
import Console from "~/components/Console.client";
import Editor from "~/components/Editor.client";

export default function Index() {
  return (
    <div className="h-full flex flex-col">
      <header className="p-4 text-white flex justify-between">
        <span className="font-bold text-lg">🖼️ WebGPU playground</span>
        
        <Link className="transition-colors bg-slate-800 hover:bg-slate-700 py-2 border text-sm border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 text-white font-semibold px-4 rounded-lg w-full flex items-center justify-center sm:w-auto" to="/login">
          Save & Share
        </Link>
      </header>

      <main className="grid grid-cols-2 h-full">
        <div className="flex flex-col">
          <ClientOnly>
            {() => (
              <>
                <Canvas />
                <Console />
              </>
            )}
          </ClientOnly>
        </div>

        <ClientOnly>
          {() => (
            <Editor />
          )}
        </ClientOnly>
      </main>
    </div>
  );
}
