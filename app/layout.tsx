import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AmbientBackground } from "@/components/AmbientBackground";

export const metadata: Metadata = {
  title: "Vedant Bhattacharyya",
  description: "Vedant Bhattacharyya — projects, running, and notes on tech, college, and life.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AmbientBackground />
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Navbar />
        <main id="main-content" className="site-main mx-auto max-w-6xl px-5 py-10 sm:px-8">{children}</main>
        <footer className="site-footer mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 sm:px-8">
          <span>Vedant Bhattacharyya</span>
          <span>Projects. Miles. Stories.</span>
        </footer>
      </body>
    </html>
  );
}

