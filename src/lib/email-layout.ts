export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Shared Local Harvest email shell — matches order notification styling. */
export function buildBrandedEmailHtml({
  title,
  bodyHtml,
  footerNote = "Local Harvest — helping UK farm shops sell direct to local customers.",
  logoUrl,
}: {
  title: string;
  bodyHtml: string;
  footerNote?: string;
  logoUrl?: string;
}) {
  const logoBlock = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="Local Harvest" width="160" style="display:block;height:auto;margin:0 0 12px;border:0;" />`
    : `<p style="margin:0;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#f7f3eb;">Local Harvest</p>`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f7f3eb;font-family:Georgia,'Times New Roman',serif;color:#4a3728;">
    <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
      <div style="background:#ffffff;border:1px solid #e8e0d4;border-radius:16px;overflow:hidden;">
        <div style="background:#8b9a6b;padding:20px 24px;">
          ${logoBlock}
          <h1 style="margin:8px 0 0;font-size:24px;color:#f7f3eb;">${escapeHtml(title)}</h1>
        </div>
        <div style="padding:24px;">
          ${bodyHtml}
        </div>
      </div>
      <p style="margin:16px 0 0;text-align:center;font-size:12px;color:#7a6a58;">
        ${escapeHtml(footerNote)}
      </p>
    </div>
  </body>
</html>`;
}

export function brandedButton(href: string, label: string) {
  return `<div style="margin-top:24px;text-align:center;">
    <a href="${href}" style="display:inline-block;background:#8b9a6b;color:#f7f3eb;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:600;">
      ${escapeHtml(label)}
    </a>
  </div>`;
}

export function brandedInfoBox(html: string) {
  return `<div style="background:#f7f3eb;border-radius:12px;padding:16px;margin:16px 0;">
    ${html}
  </div>`;
}