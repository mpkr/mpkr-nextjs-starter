"use client";

import { newVerification } from "@/lib/actions";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { HashLoader } from "react-spinners";
import { CardWrapper } from "./CardWrapper";
import { FormStatus, FormStatusProps } from "./form-status";

export const NewVerificationForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [formStatus, setFormStatus] = useState<FormStatusProps>({
    status: undefined,
    message: "",
  });

  const onSubmit = useCallback(() => {
    if (!token) {
      setFormStatus({
        status: "error",
        message: "Missing token!",
      });
      return;
    }
    newVerification(token)
      .then((data) => {
        setFormStatus({
          status: data?.status,
          message: data?.message,
        });
      })
      .catch(() => {
        setFormStatus({
          status: "error",
          message: "Something went wrong!",
        });
      });
  }, [token]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <CardWrapper
      headerLabel="Confirming your verification"
      backButtonHref="/auth/login"
      backButtonLabel="Back to login"
    >
      <div className="flex w-full flex-col items-center justify-center gap-4">
        {formStatus.status === undefined && <HashLoader color="#38BDF8" />}
        <FormStatus status={formStatus.status} message={formStatus.message} />
      </div>
    </CardWrapper>
  );
};
