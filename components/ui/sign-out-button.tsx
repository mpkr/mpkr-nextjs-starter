import { logout } from "@/lib/actions";

export const LogOutButton = ({ children }: { children: React.ReactNode }) => {
  return (
    <span onClick={() => logout()} className="cursor-pointer">
      {children}
    </span>
  );
};
