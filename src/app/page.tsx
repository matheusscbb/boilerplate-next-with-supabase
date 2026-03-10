import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-3xl font-bold text-foreground">Saitama</h1>
      <p className="text-muted-foreground">
        Base project with Next.js and Supabase
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-white transition-opacity hover:opacity-90"
        >
          Login
        </Link>
      </div>
    </main>
  );
}
