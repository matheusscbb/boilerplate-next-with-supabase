import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-3xl font-bold text-foreground">Boilerplate</h1>
      <p className="text-muted-foreground">
        Next.js + Supabase + Theme System + Design System
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-white transition-opacity hover:opacity-90"
        >
          Entrar
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-md border border-primary px-4 py-2 font-medium text-primary transition-opacity hover:opacity-90"
        >
          Criar conta
        </Link>
      </div>
    </main>
  );
}
