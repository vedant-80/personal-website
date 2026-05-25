import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/tokens";

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

  if (!subscriber || subscriber.unsubscribeTokenHash !== tokenHash) {
    return NextResponse.json({ ok: false, error: "invalid_or_expired_token" }, { status: 400 });
  }

  if (subscriber.status === "unsubscribed") {
    return NextResponse.json({ ok: true, status: "already_unsubscribed" });
  }

  await prisma.subscriber.update({
    where: { email: email.toLowerCase() },
    data: {
      status: "unsubscribed",
      unsubscribedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, status: "unsubscribed" });
}
