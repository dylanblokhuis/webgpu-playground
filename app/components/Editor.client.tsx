import Editor, { type Monaco } from "@monaco-editor/react";
import useStore from "~/state";

async function fetchWebGpuTypes() {
  const res = await fetch("/editor-types/webgpu.d.ts")
  const text = await res.text()
  return text
}

export default function EditorW() {
  const { files, currentFile, updateCurrentFile, setCurrentFile } = useStore((state) => {
    return {
      files: state.files,
      currentFile: state.files.find(it => it.name === state.currentFileKey),
      updateCurrentFile: state.updateCurrentFile,
      setCurrentFile: state.setCurrentFile
    }
  });
  // const { ts, setTs } = useStore((state) => ({ ts: state.ts, setTs: state.setTs }));

  async function handleEditorWillMount(monaco: Monaco) {
    monaco.languages.typescript.typescriptDefaults.addExtraLib(await fetchWebGpuTypes(), "webgpu.d.ts")
  }

  function handleChange(code: string | undefined) {
    if (!code) return
    updateCurrentFile(code)
  }

  return (
    <div className="flex flex-col">
      <div className="flex">
        {files.map((file) => (
          <button
            onClick={() => setCurrentFile(file.name)}
            className="bg-gray-800 text-white px-4 py-2"
          >
            {file.name}
          </button>
        ))}
      </div>
      <Editor
        className="h-full"
        defaultLanguage="typescript"
        value={currentFile?.code}
        theme="vs-dark"
        onChange={handleChange}
        beforeMount={handleEditorWillMount}
        options={{
          minimap: {
            enabled: false
          }
        }}
      />
    </div>

  )
}