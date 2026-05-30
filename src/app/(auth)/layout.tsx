import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative">
      {/* Soft ambient background — far enough away to feel atmospheric not loud */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-225 h-225 rounded-full ai-gradient opacity-10 blur-3xl" />

      <Link
        href="/"
        className="mb-8 font-headline-lg text-headline-lg font-bold tracking-tighter text-primary hover:opacity-80 transition-opacity"
      >
        Addvoxen
      </Link>

      <div
        className="glass-panel rounded-3xl p-8 sm:p-10 shadow-2xl relative"
        style={{ width: "100%", maxWidth: "560px" }}
      >
        {children}
      </div>

      <p className="mt-6 text-on-surface-variant text-xs">
        © {new Date().getFullYear()} Addvoxen · AI-native ad creative
      </p>
    </main>
  );
}
