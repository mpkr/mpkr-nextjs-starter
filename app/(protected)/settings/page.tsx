"use client";

import { useCurrentUser } from "@/hooks/use-current-user";

const SettingPage = () => {
  const user = useCurrentUser();
  return <div className="rounded-xl bg-white p-10"></div>;
};

export default SettingPage;
