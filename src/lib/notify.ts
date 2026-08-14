import "server-only";

import { getSiteSettings } from "@/lib/queries";

type InquiryPayload = {
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  propertyTitle?: string | null;
  propertyUrl?: string | null;
};

/**
 * Notifies the team about a new buyer inquiry.
 *
 * Both channels are optional and independent — a missing key simply skips that
 * channel. Failures are logged, never thrown: a notification problem must not
 * cost the team a lead that is already saved in the database.
 */
export async function notifyTeamOfInquiry(inquiry: InquiryPayload): Promise<void> {
  const settings = await getSiteSettings();
  await Promise.allSettled([sendEmail(inquiry, settings), sendWebhook(inquiry, settings)]);
}

async function sendEmail(inquiry: InquiryPayload, settings: { email: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_NOTIFY_EMAIL || settings.email;
  const from = process.env.INQUIRY_FROM_EMAIL;
  if (!apiKey || !from) return;

  const lines = [
    `Name: ${inquiry.name}`,
    `Phone: ${inquiry.phone}`,
    inquiry.email ? `Email: ${inquiry.email}` : null,
    inquiry.propertyTitle ? `Property: ${inquiry.propertyTitle}` : "General enquiry",
    inquiry.propertyUrl ? `Link: ${inquiry.propertyUrl}` : null,
    "",
    inquiry.message ?? "(no message)",
  ].filter(Boolean);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: to.split(",").map((s) => s.trim()),
        subject: inquiry.propertyTitle
          ? `New enquiry — ${inquiry.propertyTitle}`
          : "New enquiry — Prime Real Estate",
        text: lines.join("\n"),
        reply_to: inquiry.email || undefined,
      }),
    });
    if (!res.ok) console.error("Inquiry email failed:", res.status, await res.text());
  } catch (error) {
    console.error("Inquiry email failed:", error);
  }
}

/**
 * Generic outbound webhook — point it at a WhatsApp Business relay, Slack
 * incoming webhook, or anything else that accepts JSON.
 */
async function sendWebhook(inquiry: InquiryPayload, settings: { name: string }) {
  const url = process.env.INQUIRY_WEBHOOK_URL;
  if (!url) return;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: settings.name,
        receivedAt: new Date().toISOString(),
        ...inquiry,
      }),
    });
    if (!res.ok) console.error("Inquiry webhook failed:", res.status);
  } catch (error) {
    console.error("Inquiry webhook failed:", error);
  }
}
