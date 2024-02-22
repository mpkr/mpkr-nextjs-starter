import { UserRole } from "@prisma/client";

export type ExtendedUser = DefaultSession["user"] & {
  role: UserRole;
  isTwoFactorEnalbed: boolean;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
