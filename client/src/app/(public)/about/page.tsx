import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">Integrated AI Assessment Platform</Link>
        <Link href="/login" className="text-sm font-medium hover:underline">Sign In</Link>
      </header>
      <main className="flex-1 max-w-4xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold">About the Platform</h1>
        <p className="text-muted-foreground leading-relaxed">
          The Integrated AI Platform for Academic Assessment, Evaluation and Personalized Learning is designed to transform traditional higher education examination systems. Built on a modular monolith architecture, the platform unifies academic management, examination authoring, automated & evidence-linked grading, and targeted learning interventions.
        </p>
        <div className="p-6 bg-card border rounded-lg space-y-2">
          <h2 className="text-lg font-semibold">Core Principles</h2>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Strict role-based governance and audit transparency</li>
            <li>Security-first authentication with Argon2id and encrypted session cookies</li>
            <li>Evidence-linked grading with faculty moderation</li>
            <li>Modular extensibility without microservice complexity</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
