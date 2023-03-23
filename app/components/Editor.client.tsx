import { useEffect, useRef } from "react"
import Editor from "@monaco-editor/react";

export default function EditorW() {

  return (
    <Editor
			className="h-full"
     defaultLanguage="javascript"
     defaultValue="// some comment"
		 theme="vs-dark"
   />
  )
}