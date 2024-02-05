import { auth } from "@/auth";
import { LogOutButton } from "@/components/ui/sign-out-button";

const SettingPage = async () => {
  const session = await auth();
  return (
    <div>
      {JSON.stringify(session)}
      <LogOutButton />
    </div>
  );
};

export default SettingPage;
