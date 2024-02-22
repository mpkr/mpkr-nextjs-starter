"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RoleGate } from "@/components/ui/role-gate";
import { admin } from "@/lib/admin";
import { UserRole } from "@prisma/client";
import { toast } from "sonner";

const AdminPage = () => {
  const onApiRouteClick = () => {
    fetch("/api/admin").then((response) => {
      response.ok
        ? toast.success("Allowed API Route!")
        : toast.error("Forbidden API Route!");
    });
  };
  const onServerActionClick = () => {
    admin().then((data) => {
      data.error && toast.error(data.error);
      data.success && toast.success(data.success);
    });
  };
  return (
    <Card className="w-[500px]">
      <CardHeader>
        <p className="text-center text-2xl font-semibold">Admin</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <RoleGate allowedRole={UserRole.ADMIN}>abc</RoleGate>
        <div className="flex items-center justify-between rounded-lg border p-3 shadow-md">
          <p className="text-sm font-medium">Admin-only API route</p>
          <Button onClick={onApiRouteClick}>Click to test</Button>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3 shadow-md">
          <p className="text-sm font-medium">Admin-only Server action</p>
          <Button onClick={onServerActionClick}>Click to test</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPage;
