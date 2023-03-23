import { create } from "zustand";

const ts = `export default async function(canvas: HTMLCanvasElement, shaderCode: string) {
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    console.log("No adapter found");
    return;
  }
  const device = await adapter.requestDevice();
  const context = canvas.getContext('webgpu') as GPUCanvasContext;

  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  console.log("presentationFormat", presentationFormat);
  context.configure({
    device,
    format: presentationFormat,
    alphaMode: 'opaque',
  });

  const shaderModule = device.createShaderModule({
    code: shaderCode,
  })

  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: shaderModule,
      entryPoint: 'vs_main',
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'fs_main',
      targets: [
        {
          format: presentationFormat,
        },
      ],
    },
    primitive: {
      topology: 'triangle-list',
    },
  });

  requestAnimationFrame(function () {
    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();

    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.draw(3, 1, 0, 0);
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);
  });
}
`

const shaderWgsl = `@vertex
fn vs_main(
  @builtin(vertex_index) VertexIndex : u32
) -> @builtin(position) vec4<f32> {
  var pos = array<vec2<f32>, 3>(
    vec2(0.0, 0.5),
    vec2(-0.5, -0.5),
    vec2(0.5, -0.5)
  );

  return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
}

@fragment
fn fs_main() -> @location(0) vec4<f32> {
  return vec4(1.0, 0.0, 0.0, 1.0);
}
`

export interface CodeFile {
  lang: "ts" | "wgsl",
  name: string,
  code: string
  entryPoint?: boolean
}

interface State {
  files: CodeFile[]
  currentFileKey: CodeFile["name"]
  updateCurrentFile: (code: CodeFile["code"]) => void
  setCurrentFile: (name: CodeFile["name"]) => void
}

const useStore = create<State>((set) => ({
  files: [
    {
      lang: "ts",
      name: "app.ts",
      code: ts,
      entryPoint: true
    },
    {
      lang: "wgsl",
      name: "shader.wgsl",
      code: shaderWgsl
    }
  ],
  currentFileKey: "app.ts",
  updateCurrentFile(code) {
    set((state) => {
      const files = state.files.map((file) => {
        if (state.currentFileKey === file.name) {
          return {
            ...file,
            code
          }
        }
        return file
      })

      return {
        ...state,
        files
      }
    })
  },
  setCurrentFile(name) {
    set((state) => {
      return {
        ...state,
        currentFileKey: name
      }
    })
  }
}));

export default useStore;