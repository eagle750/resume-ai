import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      plan: string;
      tailorsUsed: number;
    } & DefaultSession["user"];
  }
}
