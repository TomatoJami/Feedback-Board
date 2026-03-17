import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feedback - Feedback Board",
};

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
