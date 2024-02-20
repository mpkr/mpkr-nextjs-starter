"use server";

import { signIn } from "@/auth";
import { FormStatusProps } from "@/components/ui/form-status";
import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";
import { DEFAULT_LOGIN_REDIRECT } from "@/route";
import { LoginSchema, RegisterSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";
import { db } from "./db";
import { sendVerificationEmail } from "./mail";
import { generateVerificationToken } from "./token";

export const login = async (
  formData: z.infer<typeof LoginSchema>,
): Promise<FormStatusProps> => {
  const validatedFields = LoginSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { status: "error", message: "Something went wrong" };
  }

  const { email, password } = validatedFields.data;
  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { status: "error", message: "Email is not existed" };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email,
    );
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
    );
    return { status: "success", message: "Cofirmation email sent!" };
  }

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
    console.log(JSON.parse(validatedFields.error.message));
    return {
      status: "error",
      message: JSON.parse(validatedFields.error.message)[0].message,
    };
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
    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
    );
    return { status: "success", message: "Confirmation email sent!" };
  } catch (error) {
    return { status: "error", message: "Failed to register " + error };
  }
};

export const newVerification = async (
  token: string,
): Promise<FormStatusProps> => {
  const existingToken = await getVerificationTokenByToken(token);
  if (!existingToken) {
    return { status: "error", message: "Token does not exist" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    return { status: "error", message: "Token has expired. Resend?" };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { status: "error", message: "Email dose not exist" };
  }
  await db.user.update({
    where: { id: existingUser.id },
    data: {
      emailVerified: new Date(),
      email: existingToken.email,
    },
  });

  //TODO: Change to keep
  await db.verificationToken.delete({
    where: { id: existingToken.id },
  });

  return { status: "success", message: "Email verified!" };
};
