import { requireAuth } from "@/core/auth/auth-guard";

export default async function Home() {
  const session = await requireAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-base md:text-lg">
          Welcome back, <span className="font-semibold text-foreground">{session.user?.name?.split(' ')[0]}</span>! 👋
        </p>
      </div>
    </div>
  );
}

