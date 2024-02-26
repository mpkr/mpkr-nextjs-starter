import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { CardWrapper } from "./CardWrapper";

export const ErrorCard = () => {
  return (
    <CardWrapper
      backButtonHref="/auth/login"
      backButtonLabel="Back to login"
      headerLabel="Ops! Something went wrong!"
    >
      <div className="flex w-full justify-center">
        <ExclamationTriangleIcon className="text-destructive" />
      </div>
    </CardWrapper>
  );
};
