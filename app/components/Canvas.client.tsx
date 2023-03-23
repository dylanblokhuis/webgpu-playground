import { useEffect, useRef } from "react"
import useStore, { CodeFile } from "~/state";
import * as esbuild from "esbuild-wasm"

let isEsbuildInit = false;

async function transformAndRunCode(files: CodeFile[], canvas: HTMLCanvasElement) {
  if (!isEsbuildInit) {
    await esbuild.initialize({
      worker: true,
      wasmURL: "/esbuild.wasm"
    });
    isEsbuildInit = true;
  }

  const tsEntrypoint = files.find(it => it.entryPoint);
  if (!tsEntrypoint) {
    throw new Error("No entrypoint found")
  }
  const shaderCode = files.find(it => it.lang === "wgsl");
  if (!shaderCode) {
    throw new Error("No shader code found")
  }

  const result = await esbuild.transform(tsEntrypoint.code, {
    loader: "ts",
  })

  try {
    const dataUri = 'data:text/javascript;charset=utf-8,'
      + encodeURIComponent(result.code);

    const module = await import(dataUri)
    module.default(canvas, shaderCode.code)
  } catch (error) {
    console.error(error)
  }
}

export default function Canvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const files = useStore((state) => state.files);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    transformAndRunCode(files, canvas).then(() => {
      console.log("Code executed")
    })
  }, [ref, files]);

  return (
    <canvas className="aspect-video w-full max-h-full" ref={ref} />
  )
}
