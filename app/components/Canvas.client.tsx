import { useEffect, useRef } from "react"
import useStore, { CodeFile, ConsoleLog } from "~/state";
import * as esbuild from "esbuild-wasm"

let isEsbuildInit = false;

let currentFrameCallback: number | null = null;
let fps = 0;
let lastTime = performance.now();

async function transformAndRunCode(files: CodeFile[], canvas: HTMLCanvasElement, logCb: (log: ConsoleLog) => void): Promise<boolean> {
  if (!isEsbuildInit) {
    await esbuild.initialize({
      worker: true,
      wasmURL: "/static/esbuild.wasm"
    });
    isEsbuildInit = true;
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    console.log("No adapter found");
    throw new Error("No WebGPU adapter found")
  }
  const device = await adapter.requestDevice();
  device.pushErrorScope('validation');
  const context = canvas.getContext('webgpu') as GPUCanvasContext;

  const tsEntrypoint = files.find(it => it.entryPoint);
  if (!tsEntrypoint) {
    throw new Error("No entrypoint found")
  }
  const shaderCode = files.find(it => it.lang === "wgsl");
  if (!shaderCode) {
    throw new Error("No shader code found")
  }

  const defaultConsoleLog = console.log.bind(console);
  try {
    const result = await esbuild.transform(tsEntrypoint.code, {
      loader: "ts",
    })
    const dataUri = 'data:text/javascript;charset=utf-8,'
      + encodeURIComponent(result.code);

    const module = await import(dataUri)
    console.log = (message) => {
      logCb({
        type: "log",
        message: message.toString().replace("<stdin>", tsEntrypoint.name)
      })
    }
    const frameCallback = await module.default(device, context, shaderCode.code)
    const callback = () => {
      console.log = (message) => {
        logCb({
          type: "log",
          message: message.toString().replace("<stdin>", tsEntrypoint.name)
        })
      }
      const currentTime = performance.now();
      const elapsed = currentTime - lastTime;
      fps = Math.round(1000 / elapsed);
      lastTime = currentTime;
      frameCallback();
      currentFrameCallback = requestAnimationFrame(callback);
      console.log = defaultConsoleLog;
    }

    callback()

    // currentFrameCallback = id;
    const maybeError = await device.popErrorScope();
    if (maybeError) {
      throw new Error(maybeError.message)
    }
    console.log = defaultConsoleLog;
    return true;
  } catch (error) {
    if (error instanceof Error) {
      logCb({ type: "error", message: error.message.replace("<stdin>", tsEntrypoint.name) })
    } else {
      logCb({ type: "error", message: "Unknown error" })
    }

    console.log = defaultConsoleLog;
    return false;
  }
}

export default function Canvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { files, insertLog, wipeLogs } = useStore((state) => ({ files: state.files, insertLog: state.insertLog, wipeLogs: state.wipeLogs }));

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (currentFrameCallback) cancelAnimationFrame(currentFrameCallback);
    wipeLogs();
    transformAndRunCode(files, canvas, insertLog).then((result) => { })
  }, [ref, files]);

  useEffect(() => {
    const interval = setInterval(() => {
      useStore.setState({ fps: fps })
    }, 500)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <canvas className="w-full aspect-video" ref={ref} />
  )
}
