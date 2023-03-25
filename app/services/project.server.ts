import { CodeFile } from "~/state"
import { database, generateDatabaseId, ProjectsTable } from "./db.server";

interface CreateProjectData {
  name: string
  userId: string,
  files: CodeFile[]
}
export async function createProject(
  data: CreateProjectData
) {
  const db = await database();
  const projectId = generateDatabaseId();
  await db.insertInto("projects").values({
    id: projectId,
    name: data.name,
    user_id: data.userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).execute();

  try {
    for (const file of data.files) {
      await db.insertInto("files").values({
        id: generateDatabaseId(),
        name: file.name,
        code: file.code,
        lang: file.lang,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entrypoint: file.entryPoint ? 1 : 0,
        project_id: projectId
      }).executeTakeFirstOrThrow();
    }
  } catch (error) {
    console.error(error)
    await db.deleteFrom("projects").where("id", "=", projectId).executeTakeFirstOrThrow();
    throw new Error("Failed to create project")
  }

  return projectId;
}

export async function getProjectById(id: string): Promise<ProjectsTable | undefined> {
  const db = await database();
  return db.selectFrom("projects").where("id", "=", id).selectAll().executeTakeFirst();
}