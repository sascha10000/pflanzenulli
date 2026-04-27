/**
 * Email sending service.
 * Uses SMTP via nodemailer. If SMTP_HOST is not configured, logs to console.
 */

import nodemailer, { type Transporter } from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

let transporter: Transporter | undefined;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
    });
  }
  return transporter;
}

export async function sendEmail(options: EmailOptions) {
  const from =
    options.from ??
    process.env.SMTP_FROM ??
    "Pflanzenulli <noreply@pflanzenulli.eu>";

  if (!process.env.SMTP_HOST) {
    console.log(`[Email] Would send to ${options.to}: ${options.subject}`);
    return { id: "dev-mode" };
  }

  const info = await getTransporter().sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  return { id: info.messageId };
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
