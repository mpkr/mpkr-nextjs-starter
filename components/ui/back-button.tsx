"use client";
import Link from "next/link";
import { useContext } from "react";
import { ModeContext } from "../ModeContext";
import { Button } from "./button";
import { Dialog, DialogContent, DialogTrigger } from "./dialog";
import { RegisterForm } from "./register-form";

interface BackButtonProps {
  href: string;
  label: string;
}

export const BackButton = ({ label, href }: BackButtonProps) => {
  const formMode = useContext(ModeContext);

  if (formMode === "modal") {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="link" className="w-full font-normal" size="sm">
            {label}
          </Button>
        </DialogTrigger>
        <DialogContent className="w-auto border-none bg-transparent p-0">
          <RegisterForm />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Button variant="link" className="w-full font-normal" size="sm" asChild>
      <Link href={href}>{label}</Link>
    </Button>
  );
};
