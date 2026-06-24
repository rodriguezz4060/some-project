import NextAuth from "next-auth";

export const { auth } = NextAuth({
  providers: [],
  pages: { signIn: "/" },
  trustHost: true,
});
