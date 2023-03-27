import { json } from "@remix-run/cloudflare";
import { database, migrateToLatest } from "~/services/db.server";

export async function loader() {
  const db = await database();
  const result = await migrateToLatest(db)
  return json(result)
}
