import { ClientOnly } from "remix-utils";
import Canvas from "~/components/Canvas.client";
import Editor from "~/components/Editor.client";

export default function Index() {
  return (
    <div className="h-full">
      <header className="p-4 text-white">
        <span className="font-bold text-lg">WebGPU playground</span>
      </header>
      
      <main className="grid grid-cols-2 h-full">
        <ClientOnly>
          {() => (
          <Editor />          
          )}
        </ClientOnly>

        <ClientOnly>
          {() => (
            <Canvas />
          )}
        </ClientOnly>
      </main>
      
    </div>
  );
}
