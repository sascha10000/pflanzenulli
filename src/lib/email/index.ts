/**
 * Email sending service.
 * Uses Resend in production, logs to console in development.
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = options.from ?? "Pflanzenulli <noreply@pflanzenulli.eu>";

  if (!apiKey) {
    console.log(`[Email] Would send to ${options.to}: ${options.subject}`);
    return { id: "dev-mode" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`[Email] Failed to send: ${error}`);
    throw new Error(`Email send failed: ${response.status}`);
  }

  return response.json();
}

// --- Template helpers ---

export function welcomeEmail(locale: string, displayName: string) {
  if (locale === "de") {
    return {
      subject: "Willkommen bei Pflanzenulli!",
      html: `<h1>Willkommen, ${displayName}!</h1><p>Schön, dass du dabei bist. Erstelle dein erstes Inserat und werde Teil unserer Pflanzen-Community.</p>`,
    };
  }
  return {
    subject: "Welcome to Pflanzenulli!",
    html: `<h1>Welcome, ${displayName}!</h1><p>Great to have you! Create your first listing and join our plant community.</p>`,
  };
}

export function transactionNotificationEmail(
  locale: string,
  template: string,
  data?: Record<string, string>,
) {
  const templates: Record<string, Record<string, { subject: string; html: string }>> = {
    transaction_accepted: {
      en: {
        subject: "Your offer was accepted!",
        html: "<h1>Good news!</h1><p>The seller accepted your offer. You can now exchange addresses.</p>",
      },
      de: {
        subject: "Dein Angebot wurde angenommen!",
        html: "<h1>Gute Nachrichten!</h1><p>Der Verkäufer hat dein Angebot angenommen. Ihr könnt jetzt Adressen austauschen.</p>",
      },
    },
    shipping_claimed: {
      en: {
        subject: "Your item has been shipped!",
        html: "<h1>On its way!</h1><p>The seller has marked the item as shipped. Please confirm when you receive it.</p>",
      },
      de: {
        subject: "Dein Artikel wurde versendet!",
        html: "<h1>Unterwegs!</h1><p>Der Verkäufer hat den Versand bestätigt. Bitte bestätige den Empfang.</p>",
      },
    },
    received_confirmed: {
      en: {
        subject: "Delivery confirmed!",
        html: "<h1>Transaction complete!</h1><p>The buyer confirmed receipt. Don't forget to leave a review!</p>",
      },
      de: {
        subject: "Empfang bestätigt!",
        html: "<h1>Transaktion abgeschlossen!</h1><p>Der Käufer hat den Empfang bestätigt. Vergiss nicht, eine Bewertung zu hinterlassen!</p>",
      },
    },
  };

  const localeTemplates = templates[template];
  if (!localeTemplates) {
    return { subject: "Pflanzenulli Notification", html: "<p>You have a new notification.</p>" };
  }

  return localeTemplates[locale] ?? localeTemplates["en"]!;
}
