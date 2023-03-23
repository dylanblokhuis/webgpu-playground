import { useEffect, useRef } from "react"

export default function Canvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    wgpu(canvas).then(() => {})
  }, [ref]);

  return (
    <canvas ref={ref} />
  )
}

async function wgpu(canvas: HTMLCanvasElement) {

  // const adapter = await window.navigator.gpu.requestAdapter();
  // const device = await adapter.requestDevice();

  // console.log(device);
  
}
console.log(window.navigator.gpu)