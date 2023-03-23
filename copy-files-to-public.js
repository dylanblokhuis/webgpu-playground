const fs = require("fs")

function webgpuTypes() {
  const types = fs.readFileSync("./node_modules/@webgpu/types/dist/index.d.ts")
  if (!fs.existsSync("./public/static/editor-types")) {
    fs.mkdirSync("./public/static/editor-types")
  }
  fs.writeFileSync("./public/static/editor-types/webgpu.d.ts", types)
}

function wasmFiles() {
  const wasm = fs.readFileSync("./node_modules/esbuild-wasm/esbuild.wasm")
  fs.writeFileSync("./public/static/esbuild.wasm", wasm)
}

function wgslSyntaxFiles() {
  const wasm = fs.readFileSync("./node_modules/onigasm/lib/onigasm.wasm")
  fs.writeFileSync("./public/static/onigasm.wasm", wasm)
}

function main() {
  webgpuTypes();
  wasmFiles();
  wgslSyntaxFiles();
}

main();