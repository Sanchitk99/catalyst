import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareRing - Elderly Care & Medication Management Platform",
  description:
    "Smart, interconnected healthcare management platform helping elderly individuals manage daily medications, medical appointments, and healthcare routines while keeping family and caretakers informed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-slate-50 text-slate-900 transition-colors">
        {children}
      </body>
    </html>
  );
}
