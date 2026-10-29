import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">Integrated AI Assessment Platform</Link>
        <Link href="/login" className="text-sm font-medium hover:underline">Sign In</Link>
      </header>
      <main className="flex-1 max-w-4xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold">Privacy & Data Governance</h1>
        <p className="text-muted-foreground leading-relaxed">
          The Integrated AI Assessment Platform complies with strict institutional data privacy standards. All authentication tokens are stored exclusively in HttpOnly, SameSite, Secure cookies. Passwords are never stored in plaintext and are hashed using Argon2id. Every administrative action is logged in an immutable audit trail.
        </p>
      </main>
    </div>
  );
}
