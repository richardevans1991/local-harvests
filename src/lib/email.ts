interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
  replyTo?: string;
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function getEmailFrom() {
  return (
    process.env.EMAIL_FROM?.trim() ?? "Local Harvest <onboarding@resend.dev>"
  );
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
  replyTo,
}: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return false;
  }

  const payload: Record<string, unknown> = {
    from: from?.trim() || getEmailFrom(),
    to: [to],
    subject,
    html,
    text,
  };
  if (replyTo?.trim()) {
    payload.reply_to = replyTo.trim();
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error (${res.status}): ${body}`);
  }

  return true;
}