import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { isAdminEmail } from "@/lib/admin-identity";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    signIn({ profile }) {
      return profile?.email_verified === true && isAdminEmail(profile.email);
    },
    session({ session }) {
      return session;
    },
  },
});
