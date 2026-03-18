// Shared Square API utilities

const SQUARE_SANDBOX_URL = "https://connect.squareupsandbox.com/v2";
const SQUARE_PRODUCTION_URL = "https://connect.squareup.com/v2";

// Use sandbox if the application ID starts with "sandbox-"
export function getSquareBaseUrl(): string {
  const appId = Deno.env.get("SQUARE_APPLICATION_ID") || "";
  return appId.startsWith("sandbox-") ? SQUARE_SANDBOX_URL : SQUARE_PRODUCTION_URL;
}

export function getSquareHeaders(): Record<string, string> {
  return {
    "Square-Version": "2024-11-20",
    "Authorization": `Bearer ${Deno.env.get("SQUARE_ACCESS_TOKEN")}`,
    "Content-Type": "application/json",
  };
}

export function getSquareLocationId(): string {
  return Deno.env.get("SQUARE_LOCATION_ID") || "";
}

export function getSquareAppId(): string {
  return Deno.env.get("SQUARE_APPLICATION_ID") || "";
}

export async function squareRequest(path: string, options: RequestInit = {}): Promise<any> {
  const url = `${getSquareBaseUrl()}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getSquareHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const errorDetail = data.errors?.map((e: any) => e.detail).join("; ") || JSON.stringify(data);
    throw new Error(`Square API error [${response.status}]: ${errorDetail}`);
  }

  return data;
}

// Tier pricing in cents
export const TIER_PRICING = {
  insider: {
    monthly: 4900,  // $49
    annual: 47000,   // $470
  },
  patron: {
    monthly: 7900,  // $79
    annual: 75800,   // $758
  },
} as const;

export const REVEAL_PRICE_CENTS = 3000; // $30
