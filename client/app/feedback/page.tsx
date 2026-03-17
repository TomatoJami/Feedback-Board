"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Feedback } from "@/features/feedback/types";
import { feedbackService } from "@/features/feedback/service";

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const data = await feedbackService.getAllFeedback();
        setFeedback(data);
      } catch (err) {
        setError("Failed to load feedback");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadFeedback();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
        <Link
          href="/feedback/create"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Submit Feedback
        </Link>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {feedback.length === 0 ? (
        <div className="text-center text-gray-500">No feedback yet</div>
      ) : (
        <div className="grid gap-4">
          {feedback.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {item.title}
                  </h2>
                  <p className="text-gray-600 mt-2">{item.description}</p>
                  <div className="flex gap-4 mt-4 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
                      {item.category}
                    </span>
                    <span className={`px-3 py-1 rounded ${
                      item.status === "open"
                        ? "bg-green-100 text-green-800"
                        : item.status === "in-progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}>
                      {item.status}
                    </span>
                    <span className="text-gray-500">
                      Rating: {item.rating}/5
                    </span>
                  </div>
                </div>
                <Link
                  href={`/feedback/${item.id}`}
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
