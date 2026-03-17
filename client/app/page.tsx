import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Feedback Board
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Share your thoughts and help us improve
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/feedback"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            View Feedback
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
