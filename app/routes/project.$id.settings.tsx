import { ActionArgs, json, redirect } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import { deleteProject, getProjectById } from "~/services/project.server";
import { requireUser } from "~/services/session.server";

export async function action({ request, params }: ActionArgs) {
  const user = await requireUser(request);
  const projectId = params.id;
  if (!projectId) return json({ message: "Missing project id" }, { status: 400 });
  const project = await getProjectById(projectId);
  if (!project) {
    // TODO: flash message
    return redirect("/")
  }
  if (project.user_id !== user.id) {
    return json({ message: "Unauthorized" }, { status: 401 });
  }

  await deleteProject(project.id);
  // TODO: flash message
  return redirect("/")
}

export default function ProjectSettings() {
  // const { logs } = useStore((state) => ({ logs: state.logs }));

  return (
    <Form method="post" className="p-4">
      <button className="text-red-600 hover:underline" type="submit">
        Delete project
      </button>
    </Form>
  )
}
