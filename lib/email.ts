const IS_PROD =
  process.env.NODE_ENV === "production" &&
  process.env.EMAIL_SEND_MODE === "prod";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(payload: EmailPayload) {
  if (!IS_PROD) {
    console.log("[EMAIL SINK]", {
      to: payload.to,
      subject: payload.subject,
      htmlLength: payload.html.length,
    });
    return { id: "sink" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${err}`);
  }

  return res.json();
}
