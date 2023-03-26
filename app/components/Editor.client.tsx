import Editor, { type Monaco } from "@monaco-editor/react";
import useStore from "~/state";
import { loadWASM } from 'onigasm' // peer dependency of 'monaco-textmate'
import { Registry } from 'monaco-textmate' // peer dependency
import { wireTmGrammars } from 'monaco-editor-textmate'
import clsx from "clsx";
import { useCallback } from "react";
import debounce from 'lodash.debounce';
import MenuActions from "./MenuActions";

async function fetchWebGpuTypes() {
  const res = await fetch("/static/editor-types/webgpu.d.ts")
  const text = await res.text()
  return text
}

let onigasmLoaded = false;

export default function EditorW() {
  const { files, currentFile, updateCurrentFile, setCurrentFile } = useStore((state) => {
    return {
      files: state.files,
      currentFile: state.files.find(it => it.name === state.currentFileKey),
      updateCurrentFile: state.updateCurrentFile,
      setCurrentFile: state.setCurrentFile
    }
  });

  async function handleEditorWillMount(monaco: Monaco) {
    monaco.languages.typescript.typescriptDefaults.addExtraLib(await fetchWebGpuTypes(), "webgpu.d.ts")
    monaco.languages.register({
      id: "wgsl",
    })

    monaco.editor.defineTheme('tokyo-night',
      await (await fetch('/static/tokyo-night.json')).json()
    )

    monaco.editor.setTheme("tokyo-night")

    if (!onigasmLoaded) {
      await loadWASM('/static/textmate/onigasm.wasm') // You can also pass ArrayBuffer of onigasm.wasm file
      onigasmLoaded = true
    }
    const registry = new Registry({
      getGrammarDefinition: async (scopeName) => {
        if (scopeName === 'source.wgsl') {
          return {
            format: 'json',
            content: await (await fetch(`/static/textmate/wgsl.tmLanguage.json`)).text()
          }
        }

        return {
          format: 'plist',
          content: await (await fetch(`/static/textmate/TypeScript.tmLanguage`)).text()
        }
      },
    })

    const grammars = new Map()
    grammars.set('wgsl', 'source.wgsl')
    grammars.set('typescript', 'source.ts')
    await wireTmGrammars(monaco, registry, grammars)
  }

  function handleChange(code: string | undefined) {
    if (!code) return
    updateCurrentFile(code)
  }

  const debouncedChangeHandler = useCallback(
    debounce(handleChange, 500)
    , []);

  return (
    <div className="flex flex-col border-l border-slate-700 h-full">
      <div className="flex justify-between">
        <div className="flex">
          {files.map((file) => (
            <button
              key={file.name}
              onClick={() => setCurrentFile(file.name)}
              className={clsx("text-white text-sm px-4 py-2 font-mono font-thin border-r border-t border-slate-700 hover:border-slate-600 transition-colors hover:bg-slate-800", currentFile?.name === file.name && "bg-slate-800")}
            >
              <span className="mr-2">{currentFile?.name === file.name && "🖊️"}</span>
              {file.name}
            </button>
          ))}
        </div>

        <div className="mr-2 flex gap-x-4">
          <MenuActions />
        </div>
      </div>

      <Editor
        className="h-full"
        defaultLanguage={currentFile?.lang}
        defaultValue={currentFile?.code}
        theme="vs-dark"
        onChange={debouncedChangeHandler}
        beforeMount={handleEditorWillMount}
        path={currentFile?.name}
        options={{
          minimap: {
            enabled: false,
          },
          fontSize: 16,
          fontFamily: "Ioveska"

        }}
      />
    </div>

  )
}