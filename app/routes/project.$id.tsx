import type { LoaderArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { getProjectById } from "~/services/project.server";

export async function loader({ context, request, params }: LoaderArgs) {
  const projectId = params.id;
  if (!projectId) {
    throw new Response("Not found", { status: 404 });
  }
  const project = await getProjectById(projectId)
  if (!project) {
    throw new Response("Not found", { status: 404 });
  }
  return { project };
}

export default function Project() {
  const { project } = useLoaderData<typeof loader>();
  return (
    <div>Project: {project.id}</div>
  )
}
