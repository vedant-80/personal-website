import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AmbientBackground } from "@/components/AmbientBackground";
import { SmoothScroll } from "@/components/SmoothScroll";
import { AdminAccess } from "@/components/AdminAccess";
import { SiteStats } from "@/components/SiteStats";
import { getAdminSession } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vedant Bhattacharyya",
  description: "Vedant Bhattacharyya — projects, running, and notes on tech, college, and life.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminSession();
  return (
    <html lang="en">
      <body className={admin ? "pb-24" : undefined}>
        <AmbientBackground />
        <SmoothScroll />
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Navbar />
        <main id="main-content" className="site-main mx-auto max-w-6xl px-5 py-10 sm:px-8">{children}</main>
        <SiteStats isAdmin={!!admin} />
        <AdminAccess email={admin?.user?.email} />
        <footer className="site-footer mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 sm:px-8">
          <span>Vedant Bhattacharyya</span>
          <span>Projects. Miles. Stories.</span>
        </footer>
      </body>
    </html>
  );
}

