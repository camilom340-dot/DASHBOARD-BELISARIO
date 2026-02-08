import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Belisario — Dashboard Scorecard", description: "Dashboard visual scorecard" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="es"><body className="min-h-screen">{children}</body></html>);
}
