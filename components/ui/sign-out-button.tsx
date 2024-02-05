import { signOut } from "@/auth";
import { Button } from "./button";

export const LogOutButton = () => {
  return (
    <form
      action={async () => {
        'use server'
        await signOut();
      }}
    >
      <Button type="submit">Sign Out</Button>
    </form>
  );
};
