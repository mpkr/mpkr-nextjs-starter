"use server";

import { signIn } from "@/auth";
import { FormStatusProps } from "@/components/ui/form-status";
import { DEFAULT_LOGIN_REDIRECT } from "@/route";
import { LoginSchema, RegisterSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";
import { db } from "./db";

export const login = async (
  formData: z.infer<typeof LoginSchema>,
): Promise<FormStatusProps> => {
  const validatedFields = LoginSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { status: "error", message: "Something went wrong" };
  }

  const { email, password } = validatedFields.data;
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
    console.log("successfully login");
    return { status: "success", message: "Email sent!" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { status: "error", message: "Invalid credentials" };
        default:
          return { status: "error", message: "Something went wrong!" };
      }
    }
    throw error;
  }
};

export const register = async (
  formData: z.infer<typeof RegisterSchema>,
): Promise<FormStatusProps> => {
  const validatedFields = await RegisterSchema.safeParseAsync(formData);
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
        name: username,
        email,
        password: hashedPassword,
      },
    });
    return { status: "success", message: "Registration successful!" };
  } catch (error) {
    return { status: "error", message: "Failed to register " + error };
  }
};
