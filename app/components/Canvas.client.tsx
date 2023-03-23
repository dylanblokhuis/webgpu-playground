import { useEffect, useRef } from "react"
import useStore, { CodeFile } from "~/state";
import * as esbuild from "esbuild-wasm"

let isEsbuildInit = false;

async function transformAndRunCode(files: CodeFile[], canvas: HTMLCanvasElement, errorCb: (error: string) => void): Promise<boolean> {
  if (!isEsbuildInit) {
    await esbuild.initialize({
      worker: true,
      wasmURL: "/static/esbuild.wasm"
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

  try {
    const result = await esbuild.transform(tsEntrypoint.code, {
      loader: "ts",
    })
    const dataUri = 'data:text/javascript;charset=utf-8,'
      + encodeURIComponent(result.code);

    const module = await import(dataUri)
    await module.default(canvas, shaderCode.code)
    return true;
  } catch (error) {
    if (error instanceof Error) {
      errorCb(error.message.replace("<stdin>", tsEntrypoint.name))
    } else {
      errorCb("Unknown error")
    }
    return false;
  }
}

export default function Canvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const files = useStore((state) => state.files);
  const insertError = useStore((state) => state.insertError);
  const wipeErrors = useStore((state) => state.wipeErrors);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    transformAndRunCode(files, canvas, insertError).then((result) => {
      console.log("Code executed")
      if (result) wipeErrors();
    })
  }, [ref, files]);

  return (
    <canvas className="aspect-video w-full max-h-full" ref={ref} />
  )
}
