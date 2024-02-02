"use client";

import { cn } from "@/lib/utils";
import {
  CheckCircledIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";

export interface FormStatusProps {
  status: undefined | "error" | "success";
  message: string | undefined;
}

export const FormStatus = ({ status, message }: FormStatusProps) => {
  if (!status) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-x-2 rounded-md p-3 text-sm",
        status === "error"
          ? "bg-destructive/15 text-destructive"
          : "bg-emerald-500/15 text-emerald-500",
      )}
    >
      {status === "error" ? (
        <ExclamationTriangleIcon className="h-4 w-4" />
      ) : (
        <CheckCircledIcon />
      )}
      <p>{message}</p>
    </div>
  );
};
