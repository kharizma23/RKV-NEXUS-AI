import Link from 'next/link';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">Integrated AI Assessment Platform</Link>
        <Link href="/login" className="text-sm font-medium hover:underline">Sign In</Link>
      </header>
      <main className="flex-1 max-w-4xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold">Platform Capabilities</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-5 border rounded-lg bg-card">
            <h3 className="font-semibold text-base mb-1">Phase 0 & 1: Core Foundation</h3>
            <p className="text-sm text-muted-foreground">Argon2id authentication, JWT rotation, role-based dashboards, administrator faculty approval, and audit logs.</p>
          </div>
          <div className="p-5 border rounded-lg bg-card">
            <h3 className="font-semibold text-base mb-1">Phase 2: Academic Management</h3>
            <p className="text-sm text-muted-foreground">Course outcomes, syllabus intelligence, unit/topic mappings, student enrolment, and faculty assignments.</p>
          </div>
          <div className="p-5 border rounded-lg bg-card">
            <h3 className="font-semibold text-base mb-1">Phase 3: Assessment Core</h3>
            <p className="text-sm text-muted-foreground">Question bank, blueprints, scheduling, online exam environment with autosave, and objective grading.</p>
          </div>
          <div className="p-5 border rounded-lg bg-card">
            <h3 className="font-semibold text-base mb-1">Phase 4 & 5: AI & Misconception Detection</h3>
            <p className="text-sm text-muted-foreground">Evidence-linked grading, faculty moderation, misconception identification, and mastery maps.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
