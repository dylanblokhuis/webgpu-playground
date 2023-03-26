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

export async function updateOrCloneProject(
  projectId: string,
  data: CreateProjectData
) {
  const db = await database();
  const project = await getProjectById(projectId);

  if (!project) {
    throw new Error("Cannot clone or update, project not found")
  }

  // if a user wants to clone an existing project, we do that here
  if (project.user_id !== data.userId) {
    return createProject(data);
  }

  await db.updateTable("projects").set({
    name: data.name,
    updated_at: new Date().toISOString(),
  }).where("id", "=", projectId).executeTakeFirstOrThrow();

  const existingFiles = await getProjectFiles(projectId);

  for (const file of data.files) {
    const existingFile = existingFiles.find((f) => f.name === file.name);
    if (existingFile) {
      await db.updateTable("files").set({
        code: file.code,
        updated_at: new Date().toISOString(),
      }).where("id", "=", existingFile.id).executeTakeFirstOrThrow();
    } else {
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
  }

  return projectId;
}

export async function getProjectById(id: string): Promise<ProjectsTable | undefined> {
  const db = await database();
  return db.selectFrom("projects").where("id", "=", id).selectAll().executeTakeFirst();
}
export async function getProjectFiles(projectId: string) {
  const db = await database();
  return db.selectFrom("files").where("project_id", "=", projectId).selectAll().execute();
}

interface GetProjecstOpts { }
export async function getProjects(opts: GetProjecstOpts) {
  const db = await database();
  const projects = db.selectFrom("projects")
    .innerJoin("users", "users.id", "projects.user_id")
    .select(["projects.id", "projects.name", "projects.description", "users.name as user_name"])
    .execute();

  return projects;
}