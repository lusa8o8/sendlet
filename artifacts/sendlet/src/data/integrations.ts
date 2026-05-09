const CONNECTIONS_KEY = "sendlet_integrations";

export type ConfigField = {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "password" | "email" | "url";
  hint?: string;
  required?: boolean;
};

export type IntegrationProvider = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: "email" | "crm" | "spreadsheet" | "notification";
  brandColor: string;
  textColor: "white" | "dark";
  initials: string;
  connectType: "apikey" | "oauth" | "webhook";
  fields: ConfigField[];
};

export type IntegrationConnection = {
  providerId: string;
  connectedAt: string;
  config: Record<string, string>;
};

export const PROVIDERS: IntegrationProvider[] = [
  {
    id: "resend",
    name: "Resend",
    tagline: "Send emails from your own domain",
    description:
      "Connect Resend to send broadcast emails directly from Sendlet using your own domain. Set up in under 2 minutes.",
    category: "email",
    brandColor: "#000000",
    textColor: "white",
    initials: "Re",
    connectType: "apikey",
    fields: [
      {
        key: "apiKey",
        label: "API key",
        placeholder: "re_...",
        type: "password",
        hint: "Create a key at resend.com/api-keys",
        required: true,
      },
      {
        key: "fromEmail",
        label: "From email",
        placeholder: "hello@yourdomain.com",
        type: "email",
        hint: "Must be a verified domain in your Resend account",
        required: true,
      },
      {
        key: "fromName",
        label: "From name (optional)",
        placeholder: "Your Name or Brand",
        type: "text",
        required: false,
      },
    ],
  },
  {
    id: "kit",
    name: "Kit",
    tagline: "Creator-first email marketing",
    description:
      "Add every new lead directly to a Kit form or sequence. The #1 tool for independent creators.",
    category: "email",
    brandColor: "#FB6970",
    textColor: "white",
    initials: "K",
    connectType: "apikey",
    fields: [
      {
        key: "apiKey",
        label: "API key",
        placeholder: "Paste your Kit API key",
        type: "password",
        hint: "Found in Kit → Settings → Developer",
        required: true,
      },
      {
        key: "formId",
        label: "Form or sequence ID",
        placeholder: "e.g. 4521987",
        type: "text",
        hint: "The ID of the form subscribers should be added to",
        required: true,
      },
    ],
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    tagline: "The world's most popular email tool",
    description:
      "Send new leads straight to a Mailchimp audience list automatically.",
    category: "email",
    brandColor: "#241C15",
    textColor: "white",
    initials: "M",
    connectType: "apikey",
    fields: [
      {
        key: "apiKey",
        label: "API key",
        placeholder: "Paste your Mailchimp API key",
        type: "password",
        hint: "Found in Mailchimp → Account → Extras → API keys",
        required: true,
      },
      {
        key: "audienceId",
        label: "Audience ID",
        placeholder: "e.g. a1b2c3d4e5",
        type: "text",
        hint: "Under Audience → Settings → Audience name and defaults",
        required: true,
      },
    ],
  },
  {
    id: "beehiiv",
    name: "Beehiiv",
    tagline: "Built for newsletter growth",
    description:
      "Add leads directly to your Beehiiv publication as new subscribers.",
    category: "email",
    brandColor: "#1a1a2e",
    textColor: "white",
    initials: "B",
    connectType: "apikey",
    fields: [
      {
        key: "apiKey",
        label: "API key",
        placeholder: "Paste your Beehiiv API key",
        type: "password",
        hint: "Found in Beehiiv → Settings → Integrations → API",
        required: true,
      },
      {
        key: "publicationId",
        label: "Publication ID",
        placeholder: "pub_xxxxxxxx",
        type: "text",
        hint: "Found in your Beehiiv publication settings",
        required: true,
      },
    ],
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    tagline: "Every lead in a spreadsheet, automatically",
    description:
      "A new row is added to your chosen sheet every time someone opts in. No manual exports.",
    category: "spreadsheet",
    brandColor: "#34A853",
    textColor: "white",
    initials: "G",
    connectType: "apikey",
    fields: [
      {
        key: "spreadsheetUrl",
        label: "Spreadsheet URL",
        placeholder: "https://docs.google.com/spreadsheets/d/...",
        type: "url",
        hint: "Paste the full URL of the Google Sheet you want leads added to",
        required: true,
      },
      {
        key: "sheetName",
        label: "Sheet tab name (optional)",
        placeholder: "e.g. Leads",
        type: "text",
        hint: "Leave blank to add rows to the first tab",
        required: false,
      },
    ],
  },
  {
    id: "airtable",
    name: "Airtable",
    tagline: "Leads land in your base automatically",
    description:
      "Every opt-in creates a new record in your chosen Airtable table.",
    category: "spreadsheet",
    brandColor: "#E67E00",
    textColor: "white",
    initials: "At",
    connectType: "apikey",
    fields: [
      {
        key: "apiKey",
        label: "Personal access token",
        placeholder: "pat...",
        type: "password",
        hint: "Create one at airtable.com/create/tokens",
        required: true,
      },
      {
        key: "baseId",
        label: "Base ID",
        placeholder: "app...",
        type: "text",
        hint: "Found in your base's API docs at airtable.com/api",
        required: true,
      },
      {
        key: "tableName",
        label: "Table name",
        placeholder: "e.g. Leads",
        type: "text",
        required: true,
      },
    ],
  },
  {
    id: "hubspot",
    name: "HubSpot",
    tagline: "Free CRM trusted by millions",
    description:
      "Every lead becomes a new contact in your HubSpot CRM automatically.",
    category: "crm",
    brandColor: "#FF7A59",
    textColor: "white",
    initials: "H",
    connectType: "apikey",
    fields: [
      {
        key: "apiKey",
        label: "Private app token",
        placeholder: "pat-...",
        type: "password",
        hint: "Create a private app at app.hubspot.com → Settings → Integrations → Private Apps",
        required: true,
      },
    ],
  },
  {
    id: "email-notify",
    name: "Email notifications",
    tagline: "Get notified every time someone signs up",
    description:
      "Sendlet emails you whenever a new lead opts in to any of your pages.",
    category: "notification",
    brandColor: "#0F766E",
    textColor: "white",
    initials: "✉",
    connectType: "apikey",
    fields: [
      {
        key: "email",
        label: "Send notifications to",
        placeholder: "you@example.com",
        type: "email",
        required: true,
      },
    ],
  },
  {
    id: "zapier",
    name: "Zapier",
    tagline: "Connect to 5,000+ apps in one step",
    description:
      "Paste a Zapier webhook URL and every new lead fires a trigger. Works with almost any tool.",
    category: "notification",
    brandColor: "#FF4A00",
    textColor: "white",
    initials: "Z",
    connectType: "webhook",
    fields: [
      {
        key: "webhookUrl",
        label: "Webhook URL",
        placeholder: "https://hooks.zapier.com/hooks/catch/...",
        type: "url",
        hint: "Create a Zap → choose Webhooks by Zapier as the trigger → copy the URL",
        required: true,
      },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    tagline: "Instant lead alerts in your channel",
    description:
      "Get a Slack message the moment someone opts in — in any channel you choose.",
    category: "notification",
    brandColor: "#4A154B",
    textColor: "white",
    initials: "Sl",
    connectType: "webhook",
    fields: [
      {
        key: "webhookUrl",
        label: "Slack webhook URL",
        placeholder: "https://hooks.slack.com/services/...",
        type: "url",
        hint: "Create an incoming webhook at api.slack.com/apps",
        required: true,
      },
      {
        key: "channelName",
        label: "Channel (optional)",
        placeholder: "#leads",
        type: "text",
        hint: "Defaults to the webhook's configured channel",
        required: false,
      },
    ],
  },
];

export const DISPLAY_GROUPS: { label: string; description: string; ids: string[] }[] = [
  {
    label: "Email marketing",
    description: "Send broadcasts and automatically add new leads to your email list.",
    ids: ["resend", "kit", "mailchimp", "beehiiv"],
  },
  {
    label: "Spreadsheets & CRMs",
    description: "Log every lead in a spreadsheet or your CRM.",
    ids: ["google-sheets", "airtable", "hubspot"],
  },
  {
    label: "Notifications & automation",
    description: "Get notified instantly or trigger multi-step workflows.",
    ids: ["email-notify", "zapier", "slack"],
  },
];

// ─── Persistence ─────────────────────────────────────────────

function loadConnections(): Record<string, IntegrationConnection> {
  try {
    const raw = localStorage.getItem(CONNECTIONS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, IntegrationConnection>) : {};
  } catch {
    return {};
  }
}

function persistConnections(conns: Record<string, IntegrationConnection>) {
  try {
    localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(conns));
  } catch {}
}

export const integrationConnections: Record<string, IntegrationConnection> =
  loadConnections();

export function saveConnection(providerId: string, config: Record<string, string>) {
  integrationConnections[providerId] = {
    providerId,
    config,
    connectedAt: new Date().toISOString(),
  };
  persistConnections(integrationConnections);
}

export function removeConnection(providerId: string) {
  delete integrationConnections[providerId];
  persistConnections(integrationConnections);
}

export function isConnected(providerId: string): boolean {
  return !!integrationConnections[providerId];
}
