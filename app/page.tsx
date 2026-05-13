import { LoginForm } from "@/components/auth/LoginForm";

export default function Home() {
  return (
    <div className="flex h-full min-h-[100dvh] w-full max-w-full flex-1 flex-col overflow-hidden overscroll-none">
      <LoginForm />
    </div>
  );
}
