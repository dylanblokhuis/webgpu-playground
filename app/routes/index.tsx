import { ClientOnly } from "remix-utils";
import Canvas from "~/components/Canvas.client";
import Editor from "~/components/Editor.client";


export function headers() {
  return {
    "Origin-Trial": "Aotk4lKyJjKvozg4JQVI4jGolGC06ZvTfZvwadeZiFeSA0v7WAcM4B5aheEG632PcQTxLQDazEEFfF1k5Sr7agIAAABJeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJmZWF0dXJlIjoiV2ViR1BVIiwiZXhwaXJ5IjoxNjkxNzExOTk5fQ==",
  };
}

export default function Index() {
  return (
    <div className="h-full flex flex-col">
      <header className="p-4 text-white">
        <span className="font-bold text-lg">WebGPU playground</span>
      </header>

      <main className="grid grid-cols-2 h-full">
        <ClientOnly>
          {() => (
            <Canvas />
          )}
        </ClientOnly>
        <ClientOnly>
          {() => (
            <Editor />
          )}
        </ClientOnly>

      </main>

    </div>
  );
}
