import Link from 'next/link';

export default function RegisterSelectionPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          Create an Account
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Select your registration portal below to get started.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm flex flex-col justify-between hover:border-indigo-500 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-2xl text-indigo-600 dark:text-indigo-400 mb-4 font-bold">
                🎓
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Student Registration
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Register as a student to access your assigned subjects, live examinations, explainable scorecards, and personalized remedial learning paths.
              </p>
            </div>
            <div className="mt-8">
              <Link
                href="/register/student"
                className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Register as Student →
              </Link>
            </div>
          </div>

          {/* Faculty Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm flex flex-col justify-between hover:border-indigo-500 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-2xl text-emerald-600 dark:text-emerald-400 mb-4 font-bold">
                👨‍🏫
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Faculty Registration
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Register as a faculty member to manage subjects, author question banks with KaTeX formulas, run pre-publication paper quality gates, and grade descriptive answers.
              </p>
            </div>
            <div className="mt-8">
              <Link
                href="/register/faculty"
                className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Register as Faculty →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          Already registered?{' '}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
