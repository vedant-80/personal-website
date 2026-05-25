"use server";

import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export async function notifySubscribers(post: {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  const subscribers = await prisma.subscriber.findMany({
    where: { status: "confirmed" },
  });

  for (const sub of subscribers) {
    const unsubUrl = `${siteUrl}/api/unsubscribe?token=${sub.unsubscribeTokenHash}&email=${encodeURIComponent(sub.email)}`;

    await sendEmail({
      to: sub.email,
      subject: `New: ${post.title}`,
      html: `
        <h2>${post.title}</h2>
        <p>A new post is live.</p>
        ${post.excerpt ? `<p>${post.excerpt}</p>` : ""}
        <p><a href="${postUrl}">Read the post</a></p>
        <hr />
        <p style="font-size:12px;color:#888;"><a href="${unsubUrl}">Unsubscribe</a></p>
      `,
    });
  }

  await prisma.post.update({
    where: { id: post.id },
    data: { lastEmailedAt: new Date() },
  });
}
