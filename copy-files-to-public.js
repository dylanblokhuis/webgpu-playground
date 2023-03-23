const fs = require("fs")

function webgpuTypes() {
  const types = fs.readFileSync("./node_modules/@webgpu/types/dist/index.d.ts")
  if (!fs.existsSync("./public/editor-types")) {
    fs.mkdirSync("./public/editor-types")
  }
  fs.writeFileSync("./public/editor-types/webgpu.d.ts", types)
}

function esbuildWasm() {
  const wasm = fs.readFileSync("./node_modules/esbuild-wasm/esbuild.wasm")
  fs.writeFileSync("./public/esbuild.wasm", wasm)
}

function main() {
  webgpuTypes();
  esbuildWasm();
}

main();