import { createCookieSessionStorage, SessionData, SessionStorage } from "@remix-run/cloudflare";
import { redirect } from "react-router";
import { UsersTable } from "./db.server";
import { requireContext } from "./oneshot.server";
import { getUserById } from "./user.server";

let sessionStorageMem: SessionStorage<SessionData, SessionData>;
export const sessionStorage = () => {
  if (sessionStorageMem) return sessionStorageMem;
  sessionStorageMem = createCookieSessionStorage({
    // a Cookie from `createCookie` or the same CookieOptions to create one
    cookie: {
      name: "__session",
      secrets: [requireContext().SESSION_SECRET || "secret123"],
      sameSite: "lax",
    },
  });
  return sessionStorageMem;
}


const USER_SESSION_KEY = "userId";

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage().getSession(cookie);
}

export async function getUserId(
  request: Request
): Promise<UsersTable["id"] | undefined> {
  const session = await getSession(request);
  const userId = session.get(USER_SESSION_KEY);
  return userId;
}

export async function getUser(request: Request): Promise<UsersTable | undefined> {
  const userId = await getUserId(request);
  if (userId === undefined) return undefined;

  const user = await getUserById(userId);
  if (user) return user;
  return undefined
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request;
  userId: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage().commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage().destroySession(session),
    },
  });
}
