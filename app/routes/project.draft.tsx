import { ActionArgs, json } from '@remix-run/cloudflare'
import { redirect } from 'react-router';
import { UsersTable } from '~/services/db.server';
import { createProject } from '~/services/project.server';
import { getUser } from '~/services/session.server';
import { createUserByIp } from '~/services/user.server';
import { CodeFile } from '~/state';
import { ClientOnly } from "remix-utils";
import Canvas from "~/components/Canvas.client";
import Console from "~/components/Console.client";
import Editor from "~/components/Editor.client";

export async function action({ request, context }: ActionArgs) {
  const data = await request.formData();
  console.log(request.headers)

  const filesJson = data.get("files");
  if (!filesJson) {
    return json("Missing files", { status: 400 });
  }
  const name = data.get("name");
  if (!name) {
    return json("Missing name", { status: 400 });
  }

  let user: UsersTable | undefined = await getUser(request);
  if (!user) {
    user = await createUserByIp(request)
    if (!user) {
      return json("Failed to save...", { status: 500 });
    }
  }

  const files = JSON.parse(filesJson as string) as CodeFile[];
  try {
    const projectId = await createProject({
      name: name as string,
      userId: user.id,
      files,
    })
    return redirect(`/project/${projectId}`);
  } catch (error) {
    console.error(error);
    return json("Failed to save...", { status: 500 });
  }
}

export default function Draft() {
  return (
    <div className="grid grid-cols-2 flex-grow h-full">
      <div className="flex flex-col overflow-hidden h-full">
        <ClientOnly>
          {() => (
            <>
              <Canvas />
              <Console />
            </>
          )}
        </ClientOnly>
      </div>

      <ClientOnly>
        {() => (
          <Editor />
        )}
      </ClientOnly>
    </div>
  );
}
