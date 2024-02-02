"use server";

import { FormStatusProps } from "@/components/ui/form-status";
import { LoginSchema, RegisterSchema } from "@/schemas";
import bcrypt from "bcrypt";
import { z } from "zod";
import { db } from "./db";

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

  const { email, password, username } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  // const existingUser = await getUserByEmail(email);
  // if (existingUser)
  //   return { status: "error", message: "Email is already taken" };

  try {
    await db.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
    return { status: "success", message: "Registration successful!" };
  } catch (error) {
    return { status: "error", message: "Failed to register " + error };
  }
};
