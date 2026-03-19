import { ROUTES } from "./constants";

export async function isLoggedIn(): Promise<boolean> {
  try {
    const res = await fetch(ROUTES.checkAuth, { credentials: "include" });
    const data = await res.json();
    return !!data?.user;
  } catch {
    return false;
  }
}
