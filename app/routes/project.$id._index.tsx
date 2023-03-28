import { SerializeFrom } from "@remix-run/cloudflare";
import { useRouteLoaderData } from "@remix-run/react";
import Markdown from 'markdown-to-jsx';
import { shallow } from "zustand/shallow";
import useStore from "~/state";
import { loader } from "./project.$id"


export default function Project() {
  const { project } = useRouteLoaderData("routes/project.$id") as SerializeFrom<typeof loader>;
  const { files, createFile, setCurrentFile } = useStore((state) => ({ files: state.files, createFile: state.createFile, setCurrentFile: state.setCurrentFile }), shallow);
  const readme = files.find(file => file.name === "README.md")

  return (
    <div className="p-3 prose prose-invert h-full max-w-full">
      {readme ? (
        <Markdown>
          {readme?.code || ""}
        </Markdown>
      ) : (
        <div className="text-center">
          <button onClick={() => {
            createFile({
              lang: "markdown",
              name: "README.md",
              code: `# ${project ? project.name : "Untitled"}`
            })
            setCurrentFile("README.md")
          }} className="underline text-blue-400" type="button">
            Create a README.md file
          </button>
        </div>
      )}
    </div>
  )
}
