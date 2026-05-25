import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateToken, hashToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email as string || "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }

    const existing = await prisma.subscriber.findUnique({ where: { email } });

    if (existing?.status === "confirmed") {
      return NextResponse.json({ ok: true, message: "If this email can receive mail, we sent a confirmation link." });
    }

    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.subscriber.upsert({
      where: { email },
      update: {
        status: "pending",
        confirmTokenHash: tokenHash,
        confirmTokenExpiresAt: expiresAt,
      },
      create: {
        email,
        status: "pending",
        confirmTokenHash: tokenHash,
        confirmTokenExpiresAt: expiresAt,
      },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const confirmUrl = `${siteUrl}/api/confirm?token=${token}&email=${encodeURIComponent(email)}`;

    await sendEmail({
      to: email,
      subject: "Confirm your subscription",
      html: `
        <h2>Confirm your subscription</h2>
        <p>Someone requested email updates. Click below to confirm:</p>
        <p><a href="${confirmUrl}">Confirm subscription</a></p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });

    return NextResponse.json({ ok: true, message: "If this email can receive mail, we sent a confirmation link." });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
