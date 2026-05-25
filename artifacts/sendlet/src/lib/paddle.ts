declare global {
  interface Window {
    Paddle?: {
      Environment?: {
        set: (environment: "sandbox" | "production") => void;
      };
      Initialize: (options: { token: string }) => void;
      Checkout: {
        open: (options: {
          items: Array<{ priceId: string; quantity: number }>;
          customer?: { email: string };
          customData?: Record<string, string>;
          settings?: { successUrl?: string };
        }) => void;
      };
    };
  }
}

export type PaddlePlan = "starter" | "pro" | "agency";

export const paddlePlans: Record<PaddlePlan, {
  key: PaddlePlan;
  name: string;
  price: string;
  priceId: string;
  description: string;
  limits: string[];
}> = {
  starter: {
    key: "starter",
    name: "Starter",
    price: "$9.99",
    priceId: import.meta.env.VITE_PADDLE_PRICE_STARTER ?? "",
    description: "For creators publishing a few focused lead magnets.",
    limits: ["10 live pages", "1,000 leads/month", "1,000 delivery emails/month", "10 MB uploads"],
  },
  pro: {
    key: "pro",
    name: "Pro",
    price: "$29.99",
    priceId: import.meta.env.VITE_PADDLE_PRICE_PRO ?? "",
    description: "For operators publishing regularly and needing more room.",
    limits: ["50 live pages", "5,000 leads/month", "5,000 delivery emails/month", "25 MB uploads"],
  },
  agency: {
    key: "agency",
    name: "Agency",
    price: "$59.99",
    priceId: import.meta.env.VITE_PADDLE_PRICE_AGENCY ?? "",
    description: "For teams managing multiple clients or campaigns.",
    limits: ["250 live pages", "25,000 leads/month", "25,000 delivery emails/month", "50 MB uploads"],
  },
};

let paddleLoadPromise: Promise<NonNullable<typeof window.Paddle>> | null = null;
let initialized = false;

function loadPaddleScript() {
  if (window.Paddle) return Promise.resolve(window.Paddle);
  if (paddleLoadPromise) return paddleLoadPromise;

  paddleLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-sendlet-paddle]");
    if (existing) {
      existing.addEventListener("load", () => window.Paddle ? resolve(window.Paddle) : reject(new Error("Paddle did not load")));
      existing.addEventListener("error", () => reject(new Error("Could not load Paddle")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.dataset.sendletPaddle = "true";
    script.onload = () => window.Paddle ? resolve(window.Paddle) : reject(new Error("Paddle did not load"));
    script.onerror = () => reject(new Error("Could not load Paddle"));
    document.head.appendChild(script);
  });

  return paddleLoadPromise;
}

export async function loadPaddle() {
  const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
  if (!clientToken) throw new Error("Missing Paddle client token");

  const Paddle = await loadPaddleScript();
  if (!initialized) {
    const environment = import.meta.env.VITE_PADDLE_ENVIRONMENT;
    if (environment === "sandbox") {
      Paddle.Environment?.set("sandbox");
    }
    Paddle.Initialize({ token: clientToken });
    initialized = true;
  }

  return Paddle;
}

export async function openPaddleCheckout(
  plan: PaddlePlan,
  options: { workspaceId: string; email?: string | null },
) {
  const Paddle = await loadPaddle();
  const priceId = paddlePlans[plan].priceId;
  if (!priceId) throw new Error(`Missing Paddle price ID for ${plan}`);

  Paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customer: options.email ? { email: options.email } : undefined,
    customData: {
      product: "sendlet",
      plan,
      workspace_id: options.workspaceId,
    },
    settings: {
      successUrl: `${window.location.origin}/billing?checkout=success`,
    },
  });
}
