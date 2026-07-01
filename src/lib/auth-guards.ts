import { auth } from "@root/lib/auth";
import { redirect } from "next/navigation";

export async function requireModerator() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "moderator")) {
    redirect("/");
  }
  return session;
}
