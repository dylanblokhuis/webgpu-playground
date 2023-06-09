import { useFetcher, useMatches, useRouteLoaderData } from '@remix-run/react'
import React, { useEffect } from 'react'
import useStore from '~/state';
import { shallow } from 'zustand/shallow'
import { SerializeFrom } from '@remix-run/cloudflare';
import { loader } from '~/root';

export default function MenuActions() {
  const fetcher = useFetcher();
  const data = useRouteLoaderData("root") as SerializeFrom<typeof loader>;
  const { files, project, unsavedChanges } = useStore(state => ({ files: state.files, project: state.project, unsavedChanges: state.unsavedChanges }), shallow)

  function handleSubmit() {
    let name = project ? project.name : "Untitled"
    const markdown = files.find(f => f.name === "README.md")
    const firstLine = markdown?.code.split("\n")[0]
    if (firstLine?.startsWith("# ")) {
      name = firstLine.split("# ")[1]
    }

    fetcher.submit({
      name: name,
      files: JSON.stringify(files),
      projectId: project ? project.id : "",
    }, {
      method: "post",
      action: project ? `/project/${project.id}` : "/project/draft",
    })
    useStore.setState({ unsavedChanges: false })
  }

  // prevent leaving the page with unsaved changes
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    if (unsavedChanges) {
      window.addEventListener("beforeunload", handler);
      // clean it up, if the dirty state changes
      return () => {
        window.removeEventListener("beforeunload", handler);
      };
    }
    return () => { }
  }, [unsavedChanges])

  // handle ctrl+s to save
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.repeat) return;
      if (e.key === "s" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    }

    document.addEventListener("keydown", handler)

    return () => {
      document.removeEventListener("keydown", handler)
    }
  }, [])

  return (
    <div className='flex items-center gap-x-4'>
      <button type='button' onClick={handleSubmit} className="transition-colors bg-slate-800 hover:bg-slate-700 py-1 border text-sm border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 text-white font-semibold px-3 rounded-lg w-full flex items-center justify-center sm:w-auto -mt-1">
        {fetcher.state !== "idle" && (
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}

        {project?.user_id === data.user?.id && unsavedChanges && "Save changes"}
        {project?.user_id === data.user?.id && !unsavedChanges && fetcher.state === "idle" && "Saved"}
        {project?.user_id === data.user?.id && !unsavedChanges && fetcher.state !== "idle" && "Saving..."}
        {project?.user_id !== data.user?.id && "Fork"}
      </button>
    </div>

  )
}
