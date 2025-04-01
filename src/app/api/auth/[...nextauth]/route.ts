import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";

const handler = NextAuth({
  ...authOptions,
  callbacks: {
    ...authOptions.callbacks,
    async signIn({ user }) {
      try {
        if (user) {
          return true;
        }
        return false;
      } catch (error) {
        logger.error("Sign in error", error as Error);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };
