"use server";

import { signIn, signOut } from "@/auth";
import { FormStatusProps } from "@/components/ui/form-status";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { getUserByEmail, getUserById } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";
import { DEFAULT_LOGIN_REDIRECT } from "@/route";
import {
  LoginSchema,
  NewPasswordSchema,
  RegisterSchema,
  ResetSchema,
  SettingSchema,
} from "@/schemas";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";
import { currentUser } from "./auth";
import { db } from "./db";
import {
  sendPasswordResetEmail,
  sendTwoFactorTokenEmail,
  sendVerificationEmail,
} from "./mail";
import {
  generatePasswordResetToken,
  generateTwoFactorToken,
  generateVerificationToken,
} from "./token";

export const login = async (
  formData: z.infer<typeof LoginSchema>,
): Promise<FormStatusProps | any> => {
  const validatedFields = LoginSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { status: "error", message: "Something went wrong" };
  }

  const { email, password, code } = validatedFields.data;
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

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactorToken) {
        return { status: "error", message: "Invalid code!" };
      }

      if (twoFactorToken.token !== code) {
        return { status: "error", message: "Invalid code!" };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();
      if (hasExpired) {
        return { status: "error", message: "Code expired!" };
      }

      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id,
      );

      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }

      await db.twoFactorConfirmation.create({
        data: { userId: existingUser.id },
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);

      return { twoFactor: true };
    }
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
    return { status: "error", message: "Token has expired" };
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

export const resetPassword = async (
  formData: z.infer<typeof ResetSchema>,
): Promise<FormStatusProps> => {
  const validatedFields = ResetSchema.safeParse(formData);
  if (!validatedFields.success) {
    return {
      status: "error",
      message: JSON.parse(validatedFields.error.message)[0].message,
    };
  }

  const { email } = validatedFields.data;

  const existingUser = await getUserByEmail(email);
  if (!existingUser) return { status: "error", message: "Email not found" };

  //TODO:
  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token,
  );

  return { status: "success", message: "Reset email sent" };
};

export const setNewPassword = async (
  formData: z.infer<typeof NewPasswordSchema>,
  token?: string | null,
): Promise<FormStatusProps> => {
  if (!token) {
    return { status: "error", message: "Missing token!" };
  }

  const validatedFields = NewPasswordSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      status: "error",
      message: JSON.parse(validatedFields.error.message)[0].message,
    };
  }

  const { password, confirmPassword } = validatedFields.data;
  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return { status: "error", message: "Invalid token" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { status: "error", message: "Token has expired!" };
  }

  const existingUser = await getUserByEmail(existingToken.email);
  if (!existingUser) {
    return { status: "error", message: "Email does not exist!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  });
  await db.passwordResetToken.delete({
    where: { id: existingToken.id },
  });

  return { status: "success", message: "New password is set" };
};

export const logout = async () => {
  await signOut();
};

export const settings = async (
  values: z.infer<typeof SettingSchema>,
): Promise<FormStatusProps> => {
  const user = await currentUser();
  if (!user) return { status: "error", message: "Unauthorized" };

  const dbUser = await getUserById(user.id);
  if (!dbUser) return { status: "error", message: "Unauthorized" };

  if (user.isOAuth) {
    values.email = undefined;
    values.password = undefined;
    values.newPassword = undefined;
    values.isTwoFactorEnabled = undefined;
  }

  if (values.email && values.email !== user.email) {
    const existingUser = await getUserByEmail(values.email);
    if (existingUser && existingUser.id !== user.id) {
      return { status: "error", message: "Email already in use" };
    }
    const verificationToken = await generateVerificationToken(values.email);
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
    );

    return { status: "success", message: "Verification email sent!" };
  }

  if (values.password && values.newPassword && dbUser.password) {
    const passwordMatch = await bcrypt.compare(
      values.password,
      dbUser.password,
    );

    if (!passwordMatch)
      return { status: "error", message: "Incorrect password" };
    const hashedNewPassword = await bcrypt.hash(values.newPassword, 10);
    values.password = hashedNewPassword;
    values.newPassword = undefined;
  }

  await new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });

  await db.user.update({
    where: { id: dbUser.id },
    data: {
      ...values,
    },
  });

  return { status: "success", message: "Settings updated" };
};
