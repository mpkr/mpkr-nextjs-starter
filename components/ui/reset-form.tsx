"use client";

import { resetPassword } from "@/lib/actions";
import { ResetSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useState } from "react";
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

export const ResetForm = () => {
  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
    },
  });
  const [formStatus, setFormStatus] = useState<FormStatusProps>({
    status: undefined,
    message: "",
  });

  const onSubmit = (values: z.infer<typeof ResetSchema>) => {
    setFormStatus({
      status: undefined,
      message: "",
    });
    startTransition(() => {
      resetPassword(values).then((data) => {
        setFormStatus({
          status: data?.status,
          message: data?.message,
        });
      });
    });
  };
  return (
    <CardWrapper
      headerLabel="Forgot your password?"
      backButtonHref="/auth/login"
      backButtonLabel="Back to login"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="your-email@example.com"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormStatus status={formStatus.status} message={formStatus.message} />
          <Button type="submit" className="w-full">
            Reset Password
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
