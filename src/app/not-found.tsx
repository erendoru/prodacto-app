import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <span className="text-4xl font-black text-primary">404</span>
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Page not found</h1>
        <p className="mb-8 max-w-sm text-sm text-text-secondary">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/dashboard"
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
            Go to Dashboard
          </Link>
          <Link href="/"
            className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
