import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/ui/login-button";

export default function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-center bg-sky-400">
      <div className="space-y-6 text-center">
        <h1 className="text-6xl font-semibold text-white drop-shadow-md">
          Auth
        </h1>
        <p className="text-lg text-white">A simple authentication service</p>
        <div>
          <LoginButton mode="modal" asChild>
            <Button variant="secondary" size="lg">
              Sign in
            </Button>
          </LoginButton>
        </div>
      </div>
    </main>
  );
}
