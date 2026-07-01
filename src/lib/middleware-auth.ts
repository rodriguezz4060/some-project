import NextAuth from "next-auth";

export const { auth } = NextAuth({
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
  pages: { signIn: "/" },
  trustHost: true,
});
