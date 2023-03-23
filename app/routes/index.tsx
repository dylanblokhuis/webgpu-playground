import { ClientOnly } from "remix-utils";
import Canvas from "~/components/Canvas.client";
import Console from "~/components/Console.client";
import Editor from "~/components/Editor.client";

export default function Index() {
  return (
    <div className="h-full flex flex-col">
      <header className="p-4 text-white">
        <span className="font-bold text-lg">🖼️ WebGPU playground</span>
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
