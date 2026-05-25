import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashToken, generateToken } from "@/lib/tokens";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const email = req.nextUrl.searchParams.get("email");

  if (!token || !email) {
    return NextResponse.json({ ok: false, error: "invalid_or_expired_token" }, { status: 400 });
  }

  const tokenHash = hashToken(token);
  const subscriber = await prisma.subscriber.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!subscriber || subscriber.confirmTokenHash !== tokenHash) {
    return NextResponse.json({ ok: false, error: "invalid_or_expired_token" }, { status: 400 });
  }

  if (subscriber.confirmTokenExpiresAt && subscriber.confirmTokenExpiresAt < new Date()) {
    return NextResponse.json({ ok: false, error: "invalid_or_expired_token" }, { status: 400 });
  }

  if (subscriber.status === "confirmed") {
    return NextResponse.json({ ok: true, status: "already_confirmed" });
  }

  // Generate a persistent unsubscribe token
  const unsubToken = generateToken();
  const unsubTokenHash = hashToken(unsubToken);

  await prisma.subscriber.update({
    where: { email: email.toLowerCase() },
    data: {
      status: "confirmed",
      confirmedAt: new Date(),
      confirmTokenHash: null,
      confirmTokenExpiresAt: null,
      unsubscribeTokenHash: unsubTokenHash,
    },
  });

  return NextResponse.json({ ok: true, status: "confirmed" });
}
