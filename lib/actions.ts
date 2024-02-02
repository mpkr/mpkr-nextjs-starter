"use server";

import { FormStatusProps } from "@/components/ui/form-status";
import { LoginSchema, RegisterSchema } from "@/schemas";
import { z } from "zod";

export const login = async (
  formData: z.infer<typeof LoginSchema>,
): Promise<FormStatusProps> => {
  const validatedFields = LoginSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { status: "error", message: "Something went wrong" };
  }
  try {
    await new Promise((reject) => setTimeout(reject, 2000));
    return { status: "success", message: "Email sent!" };
  } catch (error) {
    return { status: "error", message: "Failed to login " + error };
  }
};

export const register = async (
  formData: z.infer<typeof RegisterSchema>,
): Promise<FormStatusProps> => {
  const validatedFields = RegisterSchema.safeParse(formData);
  if (!validatedFields.success) {
    return { status: "error", message: "Something went wrong" };
  }
  try {
    await new Promise((reject) => setTimeout(reject, 2000));
    console.log(formData);
    return { status: "success", message: "Registration successful!" };
  } catch (error) {
    return { status: "error", message: "Failed to register " + error };
  }
};
