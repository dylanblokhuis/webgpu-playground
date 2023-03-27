import { database, generateDatabaseId, UsersTable } from "./db.server";
import { getSession } from "./session.server";

// export async function requireUser(request: Request, db: D1Database) {
//     const session = await getSession(request.headers.get("Cookie")!);

//     session.get("")
// }I

export async function getUserById(userId: UsersTable["id"]) {
  const db = await database()
  const user = await db.selectFrom('users')
    .selectAll()
    .where('id', '=', userId)
    .executeTakeFirst()

  return user
}

async function ipHashSlice(ip: string) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex.slice(0, 8)
}

function ipFromRequest(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("CF-Connecting-IP")
  if (!ip) throw new Error("No IP found")
  return ip
}

export async function getUserByIp(request: Request): Promise<UsersTable | undefined> {
  const db = await database()

  const user = await db.selectFrom('users')
    .selectAll()
    .where('name', '=', await ipHashSlice(ipFromRequest(request)))
    .executeTakeFirst()

  return user
}

export async function createUserByIp(request: Request) {
  const db = await database()
  const userExists = await getUserByIp(request)
  if (userExists) return userExists

  const id = generateDatabaseId()
  await db.insertInto('users')
    .values({
      id: id,
      name: await ipHashSlice(ipFromRequest(request)),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .executeTakeFirst()
  const user = getUserById(id)
  if (!user) throw new Error("Failed to create user from ip")
  return user
}
