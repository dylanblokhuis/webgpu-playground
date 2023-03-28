import { useLoaderData } from "@remix-run/react";
import { getProjectById, getProjectFiles } from "~/services/project.server";


import useStore from "~/state";
import { useEffect } from "react";
import { ActionArgs, LoaderArgs, json, MetaFunction, V2_MetaFunction } from '@remix-run/cloudflare'
import { redirect } from 'react-router';
import { UsersTable } from '~/services/db.server';
import { createProject, updateOrCloneProject } from '~/services/project.server';
import { createUserSession, getUser } from '~/services/session.server';
import { createUserByIp } from '~/services/user.server';
import { CodeFile } from '~/state';
import { ClientOnly } from "remix-utils";
import Canvas from "~/components/Canvas.client";
import Editor from "~/components/Editor.client";
import PlaygroundTabs from "~/components/PlaygroundTabs";

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data.project ? `${data.project.name} - WebGPU playground` : "Draft - WebGPU playground",
    }
  ]
}

export async function loader({ context, request, params }: LoaderArgs) {
  const projectId = params.id;
  if (projectId === "draft") {
    return json({ project: null, files: [] })
  }

  if (!projectId) {
    throw new Response("Not found", { status: 404 });
  }
  const project = await getProjectById(projectId)
  if (!project) {
    throw new Response("Not found", { status: 404 });
  }
  const files = await getProjectFiles(projectId)
  return json({ project, files });
}

export async function action({ request, context }: ActionArgs) {
  const data = await request.formData();

  const filesJson = data.get("files");
  if (!filesJson) {
    return json("Missing files", { status: 400 });
  }
  const name = data.get("name");
  if (!name) {
    return json("Missing name", { status: 400 });
  }

  const existingProjectId = data.get("projectId");

  let user: UsersTable | undefined = await getUser(request);
  if (!user) {
    user = await createUserByIp(request)
    if (!user) {
      return json("Failed to save...", { status: 500 });
    }
  }

  const files = JSON.parse(filesJson as string) as CodeFile[];
  try {
    if (existingProjectId) {
      const maybeNewId = await updateOrCloneProject(existingProjectId.toString(), {
        name: name as string,
        userId: user.id,
        files,
      })

      return await createUserSession({
        request,
        redirectTo: `/project/${maybeNewId}`,
        remember: true,
        userId: user.id
      })
    }

    const projectId = await createProject({
      name: name as string,
      userId: user.id,
      files,
    })
    return await createUserSession({
      request,
      redirectTo: `/project/${projectId}`,
      remember: true,
      userId: user.id
    })
  } catch (error) {
    console.error(error);
    return json("Failed to save...", { status: 500 });
  }
}

export default function Project() {
  const { project, files } = useLoaderData<typeof loader>();

  useEffect(() => {
    if (project === null) return;
    useStore.setState({
      project,
      files: files.map(it => ({ code: it.code, name: it.name, entryPoint: it.entrypoint === 1, lang: it.lang as "wgsl" | "typescript" })),
      currentFileKey: files.find(file => file.entrypoint)?.name,
    })
  }, [project, files])

  return (
    <div className="grid grid-cols-2 flex-grow h-full">
      <div className="flex flex-col overflow-hidden h-full">
        <ClientOnly>
          {() => (
            <Canvas />
          )}
        </ClientOnly>
        <PlaygroundTabs />
      </div>

      <ClientOnly>
        {() => (
          <Editor />
        )}
      </ClientOnly>
    </div>
  )
}
