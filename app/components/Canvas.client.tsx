import { useEffect, useRef } from "react"
import useStore, { CodeFile, ConsoleLog } from "~/state";
import * as esbuild from "esbuild-wasm"
import { shallow } from "zustand/shallow";

let isEsbuildInit = false;

let currentFrameCallback: number | null = null;
let fps = 0;
let deviceContext: GPUCanvasContext | undefined;
let device: GPUDevice | undefined;

async function transformAndRunCode(files: CodeFile[], canvas: HTMLCanvasElement, logCb: (log: ConsoleLog) => void, paused: boolean): Promise<boolean> {
  if (!isEsbuildInit) {
    await esbuild.initialize({
      worker: true,
      wasmURL: "/static/esbuild.wasm",
    });
    isEsbuildInit = true;
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    console.log("No adapter found");
    throw new Error("No WebGPU adapter found")
  }
  if (!device) device = await adapter.requestDevice();
  device.pushErrorScope('validation');
  if (!deviceContext) deviceContext = canvas.getContext('webgpu') as GPUCanvasContext;

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
    const dataUri = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(result.code);

    const module = await import(dataUri)
    console.log = (message) => {
      logCb({
        type: "log",
        message: message.toString().replace("<stdin>", tsEntrypoint.name)
      })
    }
    const frameCallback = await module.default(device, deviceContext, shaderCode.code)
    let lastTime = performance.now();
    const callback = () => {
      console.log = (message) => {
        logCb({
          type: "log",
          message: message.toString().replace("<stdin>", tsEntrypoint.name)
        })
      }
      const currentTime = performance.now();
      const elapsed = currentTime - lastTime;
      if (elapsed !== 0) {
        fps = Math.round(1000 / elapsed);
      } else {
        fps = 0;
      }
      lastTime = currentTime;
      frameCallback();
      if (!paused) currentFrameCallback = requestAnimationFrame(callback);
      console.log = defaultConsoleLog;
    }


    callback()
    const maybeError = await device.popErrorScope();
    if (maybeError) throw new Error(maybeError.message)
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
  const { files, insertLog, wipeLogs, paused } = useStore((state) => ({ files: state.files, insertLog: state.insertLog, wipeLogs: state.wipeLogs, paused: state.paused }), shallow);
  const setFps = useStore((state) => state.setFps);
  let isBusyWithLastFrame = false;

  function killAllFrames() {
    if (currentFrameCallback) {
      cancelAnimationFrame(currentFrameCallback);
      while (currentFrameCallback--) {
        cancelAnimationFrame(currentFrameCallback);
        if (currentFrameCallback < 0) {
          break;
        }
      }
    }
  }

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (isBusyWithLastFrame) return;
    killAllFrames();
    wipeLogs();
    transformAndRunCode(files, canvas, insertLog, paused).then(() => { })
    isBusyWithLastFrame = true;
  }, [ref, files, paused]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFps(fps);
    }, 1000)

    return () => {
      clearInterval(interval)
      killAllFrames();
      deviceContext?.unconfigure()
      deviceContext = undefined;
      setFps(0)
    }
  }, [])

  return (
    <canvas className="w-full aspect-video" ref={ref} />
  )
}
