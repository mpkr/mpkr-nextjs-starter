import { getUserByEmail } from "@/data/user";
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }).email({
    message: "Please enter a valid email",
  }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const RegisterSchema = z
  .object({
    username: z.string().min(1, { message: "Username is required" }),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({
        message: "Please enter a valid email address",
      })
      .refine(async (data) => await getUserByEmail(data), {
        message: "Email is already taken",
      }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password do not match",
  });
