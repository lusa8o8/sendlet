import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

type BillingStatus = "free" | "trialing" | "active" | "past_due" | "paused" | "canceled";
type PlanKey = "starter" | "pro" | "agency";

const FALLBACK_PRICE_TO_PLAN: Record<string, PlanKey> = {
  pri_01ksezm37ap5wyjjmkh0t3nmrq: "starter",
  pri_01ksezrbjvwm7jy7764xx3e2at: "pro",
  pri_01ksezz71gm4sfj93emj1jcm7x: "agency",
};

const PLAN_LIMITS: Record<PlanKey, {
  leadMagnetLimit: number;
  monthlyLeadLimit: number;
  monthlyEmailLimit: number;
  fileSizeLimit: number;
}> = {
  starter: {
    leadMagnetLimit: 10,
    monthlyLeadLimit: 1_000,
    monthlyEmailLimit: 1_000,
    fileSizeLimit: 10 * 1_048_576,
  },
  pro: {
    leadMagnetLimit: 50,
    monthlyLeadLimit: 5_000,
    monthlyEmailLimit: 5_000,
    fileSizeLimit: 25 * 1_048_576,
  },
  agency: {
    leadMagnetLimit: 250,
    monthlyLeadLimit: 25_000,
    monthlyEmailLimit: 25_000,
    fileSizeLimit: 50 * 1_048_576,
  },
};

function requiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function priceToPlan(priceId: string | null): PlanKey | null {
  if (!priceId) return null;
  const envMap: Record<string, PlanKey> = {
    [Deno.env.get("PADDLE_PRICE_STARTER") ?? ""]: "starter",
    [Deno.env.get("PADDLE_PRICE_PRO") ?? ""]: "pro",
    [Deno.env.get("PADDLE_PRICE_AGENCY") ?? ""]: "agency",
  };
  return envMap[priceId] ?? FALLBACK_PRICE_TO_PLAN[priceId] ?? null;
}

function normalizeStatus(eventType: string, status: string | null): BillingStatus {
  if (eventType.includes("canceled")) return "canceled";
  if (eventType.includes("paused")) return "paused";
  if (eventType.includes("past_due")) return "past_due";
  if (eventType.includes("transaction.completed")) return "active";
  if (status === "trialing" || status === "active" || status === "past_due" || status === "paused" || status === "canceled") {
    return status;
  }
  return "active";
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function findPriceId(data: Record<string, any>): string | null {
  const firstItem = Array.isArray(data.items) ? data.items[0] : null;
  const firstLineItem = Array.isArray(data.details?.line_items) ? data.details.line_items[0] : null;
  return readString(firstItem?.price?.id)
    ?? readString(firstItem?.price_id)
    ?? readString(firstLineItem?.price_id)
    ?? readString(firstLineItem?.price?.id);
}

function periodDate(data: Record<string, any>, key: "starts_at" | "ends_at") {
  return readString(data.current_billing_period?.[key])
    ?? readString(data.currentBillingPeriod?.[key])
    ?? null;
}

function parseSignature(header: string) {
  const parts = new Map<string, string>();
  for (const section of header.split(";")) {
    const [key, ...rest] = section.trim().split("=");
    if (key && rest.length) parts.set(key, rest.join("="));
  }
  return {
    timestamp: parts.get("ts") ?? "",
    signature: parts.get("h1") ?? "",
  };
}

function hexToBytes(hex: string) {
  if (hex.length % 2 !== 0) return new Uint8Array();
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function timingSafeEqualHex(a: string, b: string) {
  const aBytes = hexToBytes(a);
  const bBytes = hexToBytes(b);
  if (aBytes.length === 0 || aBytes.length !== bBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < aBytes.length; i += 1) {
    diff |= aBytes[i] ^ bBytes[i];
  }
  return diff === 0;
}

async function hmacSha256Hex(secret: string, value: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyPaddleSignature(req: Request, rawBody: string) {
  const secret = requiredEnv("PADDLE_WEBHOOK_SECRET");
  const header = req.headers.get("paddle-signature") ?? "";
  const { timestamp, signature } = parseSignature(header);
  if (!timestamp || !signature) return false;
  const expected = await hmacSha256Hex(secret, `${timestamp}:${rawBody}`);
  return timingSafeEqualHex(expected, signature);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  const rawBody = await req.text();

  try {
    const isVerified = await verifyPaddleSignature(req, rawBody);
    if (!isVerified) {
      return jsonResponse({ error: "Invalid Paddle signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as Record<string, any>;
    const eventId = readString(event.event_id) ?? readString(event.id);
    const eventType = readString(event.event_type) ?? readString(event.type) ?? "unknown";
    const data = (event.data ?? {}) as Record<string, any>;
    const customData = (data.custom_data ?? data.customData ?? {}) as Record<string, any>;

    const workspaceIdFromCheckout = readString(customData.workspace_id) ?? readString(customData.workspaceId);
    const customerId = readString(data.customer_id) ?? readString(data.customer?.id) ?? readString(data.customerId);
    const subscriptionId = readString(data.subscription_id)
      ?? readString(data.subscription?.id)
      ?? (eventType.startsWith("subscription.") ? readString(data.id) : null);
    const transactionId = readString(data.transaction_id)
      ?? readString(data.transaction?.id)
      ?? (eventType.startsWith("transaction.") ? readString(data.id) : null);
    const priceId = findPriceId(data);
    const plan = priceToPlan(priceId);
    const status = normalizeStatus(eventType, readString(data.status));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    let workspaceId = workspaceIdFromCheckout;
    if (!workspaceId && subscriptionId) {
      const { data: workspace } = await supabase
        .from("workspaces")
        .select("id")
        .eq("paddle_subscription_id", subscriptionId)
        .maybeSingle();
      workspaceId = workspace?.id ?? null;
    }
    if (!workspaceId && customerId) {
      const { data: workspace } = await supabase
        .from("workspaces")
        .select("id")
        .eq("paddle_customer_id", customerId)
        .maybeSingle();
      workspaceId = workspace?.id ?? null;
    }

    const eventPayload = {
      workspace_id: workspaceId,
      paddle_event_id: eventId,
      event_type: eventType,
      paddle_customer_id: customerId,
      paddle_subscription_id: subscriptionId,
      paddle_transaction_id: transactionId,
      paddle_price_id: priceId,
      payload: event,
      processed_at: new Date().toISOString(),
      error_message: workspaceId ? null : "No matching workspace",
    };

    if (eventId) {
      const { error: eventError } = await supabase
        .from("billing_events")
        .upsert(eventPayload, { onConflict: "paddle_event_id" });
      if (eventError) throw eventError;
    } else {
      const { error: eventError } = await supabase.from("billing_events").insert(eventPayload);
      if (eventError) throw eventError;
    }

    if (!workspaceId || !plan) {
      return jsonResponse({ ok: true, ignored: true });
    }

    const limits = PLAN_LIMITS[plan];
    const updatePayload: Record<string, unknown> = {
      plan,
      beta_status: "active",
      billing_status: status,
      paddle_price_id: priceId,
      paddle_customer_id: customerId,
      paddle_subscription_id: subscriptionId,
      paddle_transaction_id: transactionId,
      current_period_starts_at: periodDate(data, "starts_at"),
      current_period_ends_at: periodDate(data, "ends_at"),
      trial_ends_at: readString(data.trial_dates?.ends_at) ?? readString(data.trialDates?.ends_at),
      canceled_at: eventType.includes("canceled") ? new Date().toISOString() : null,
      lead_magnet_limit: limits.leadMagnetLimit,
      monthly_lead_limit: limits.monthlyLeadLimit,
      monthly_email_limit: limits.monthlyEmailLimit,
      file_size_limit: limits.fileSizeLimit,
    };

    Object.keys(updatePayload).forEach((key) => {
      if (updatePayload[key] === null || updatePayload[key] === undefined) {
        delete updatePayload[key];
      }
    });

    const { error: workspaceError } = await supabase
      .from("workspaces")
      .update(updatePayload)
      .eq("id", workspaceId);

    if (workspaceError) throw workspaceError;

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unexpected Paddle webhook error" },
      { status: 500 },
    );
  }
});
