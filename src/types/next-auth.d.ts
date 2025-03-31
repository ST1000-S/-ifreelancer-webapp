import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "FREELANCER" | "CLIENT" | "ADMIN";
  }

  interface Session {
    user: User & {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
