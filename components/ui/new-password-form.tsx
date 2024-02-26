"use client";
import { setNewPassword } from "@/lib/actions";
import { NewPasswordSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CardWrapper } from "./CardWrapper";
import { Button } from "./button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { FormStatus, FormStatusProps } from "./form-status";
import { Input } from "./input";

export const NewPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isPending, startTransition] = useTransition();
  const [formStatus, setFormStatus] = useState<FormStatusProps>({
    status: undefined,
    message: "",
  });
  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
    setFormStatus({
      status: undefined,
      message: "",
    });
    startTransition(() => {
      setNewPassword(values, token).then((data) => {
        setFormStatus({
          status: data.status,
          message: data.message,
        });
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Set your new password"
      backButtonHref="/auth/login"
      backButtonLabel="Back to login"
    >
      {token ? (
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="******" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="******" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormStatus
              status={formStatus.status}
              message={formStatus.message}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              Set new password
            </Button>
          </form>
        </Form>
      ) : (
        <FormStatus status="error" message="Missing token!" />
      )}
    </CardWrapper>
  );
};
