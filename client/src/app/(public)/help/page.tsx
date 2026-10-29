import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">Integrated AI Assessment Platform</Link>
        <Link href="/login" className="text-sm font-medium hover:underline">Sign In</Link>
      </header>
      <main className="flex-1 max-w-4xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <div className="space-y-4">
          <div className="p-4 border rounded-md bg-card">
            <h3 className="font-semibold text-sm">How do Faculty accounts work?</h3>
            <p className="text-sm text-muted-foreground mt-1">Faculty registrations are submitted with pending status and require approval by a System Administrator before access to faculty tools is granted.</p>
          </div>
          <div className="p-4 border rounded-md bg-card">
            <h3 className="font-semibold text-sm">How do Student accounts work?</h3>
            <p className="text-sm text-muted-foreground mt-1">Students can register with their Student ID Number and gain immediate access to student portal features.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
