// Verified against the actual AeroPaywall codebase (subscription-service + connector-plugin),
// not paraphrase — see IMPLEMENTATION_PLAN.md §17 for how/when this was confirmed. Two distinct
// backends with distinct base URLs and header contracts:
//   - `subscription-service` (NestJS): auth, profile, billing, plans. Base path `/api/v1`.
//     Does NOT read `X-Device-Id` anywhere — device metering is a WordPress-side concept.
//   - AeroPaywall's WordPress `connector-plugin`: the ONLY source of per-article entitlement.
//     `GET {WP_BASE}/wp-json/aeropaywall/v1/articles/{id}` — this is a live, uncached,
//     security-sensitive call and must never be cached or duplicated client-side beyond a very
//     short in-memory dedup window (see api/entitlement.ts).

// ---- subscription-service: auth ----

export type AuthTokens = { accessToken: string; refreshToken: string };

export type RegisterRequest = { email: string; password: string; firstName?: string };
export type LoginRequest = { email: string; password: string };
export type RefreshRequest = { refreshToken: string };

export type RequestPasswordResetRequest = { email: string };
export type ConfirmPasswordResetRequest = { token: string; newPassword: string };
export type ChangePasswordRequest = { currentPassword: string; newPassword: string };

// subscription-service has no /register or /login "user" payload in its response — only a token
// pair (auth.service.ts `issueTokenPair`). The profile is fetched separately via GET /me.
export type AuthResponse = AuthTokens;

export type SubscriptionStatus = 'pending' | 'active' | 'expired' | 'cancelled';

// Verified directly against the running local subscription-service (2026-07-25) — `GET /me`
// nests subscription info under `subscription`, it is NOT a top-level `subscriptionStatus` field
// (that shape only exists as a JWT claim, not in this REST response).
export type MeSubscription = {
  id: string;
  planId?: string;
  planName: string;
  isB2b?: boolean;
  status: SubscriptionStatus;
  startsAt?: string;
  expiresAt: string;
  autoRenew: boolean;
};

export type MeResponse = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  company: string | null;
  segment: string | null;
  billingCurrency: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  subscription: MeSubscription | null;
};

export type UpdateProfileRequest = { lastName?: string; phone?: string; company?: string };

export type CancelReason =
  | 'too_expensive'
  | 'not_using_it'
  | 'missing_features'
  | 'switching_provider'
  | 'technical_issues'
  | 'other';

// ---- subscription-service: plans & checkout ----

export type SeatTier = { minSeats: number; pricePerSeatNgn: number; pricePerSeatUsd: number };

// Verified against the running server: Prisma `Decimal` fields serialize as strings over JSON,
// not numbers (`"priceNgn":"5000"`) — parse with `Number(...)` at render time, don't assume
// numeric already.
export type Plan = {
  id: string;
  name: string;
  durationDays: number;
  priceNgn: string;
  priceUsd: string;
  isB2b: boolean;
  seatMin: number | null;
  active: boolean;
  featureBullets: string[];
  trialDays: number | null;
  introPriceNgn: string | null;
  introPriceUsd: string | null;
  introDurationDays: number | null;
  seatTiers: SeatTier[];
  createdAt: string;
};

// GET /api/v1/me/subscriptions — a reader's full subscription+payment history, most recent
// first. `amount` here is already a real number (UsersService.getSubscriptionHistory maps
// Prisma's Decimal payment.amount via Number(...) server-side) — unlike Plan's price fields,
// this one does NOT need a client-side Number() conversion.
export type PaymentRow = {
  id: string;
  gateway: Gateway;
  gatewayRef: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
};

export type SubscriptionHistoryRow = {
  id: string;
  planName: string;
  status: SubscriptionStatus;
  startsAt: string | null;
  expiresAt: string;
  autoRenew: boolean;
  payments: PaymentRow[];
};

export type Gateway = 'stripe' | 'paypal' | 'paystack' | 'flutterwave';

export type CheckoutInitRequest = {
  planId: string;
  gateway: Gateway;
  couponCode?: string;
  seats?: number;
  channel?: 'mobile';
  returnUrl?: string;
};

// The server branches checkout into one of three shapes — the client must switch on `mode`,
// never assume one, regardless of which gateway it requested (gateways.interface.ts).
export type CheckoutResult =
  | { mode: 'redirect'; url: string; reference: string }
  | { mode: 'inline'; publicKey: string; reference: string; amount: number; currency: string; customerEmail: string }
  | { mode: 'mock'; reference: string };

export type CheckoutInitResponse = { checkout: CheckoutResult; pricing: Record<string, unknown> };

export type CheckoutVerifyRequest = { reference: string };
// On activation the server re-signs a fresh access token carrying updated subscriptionStatus —
// the client must overwrite its stored access token, not just flip a local flag.
export type CheckoutVerifyResponse = { activated: false } | { activated: true; accessToken: string };

export type CouponValidateRequest = { code: string; planId: string; currency: 'NGN' | 'USD'; seats?: number };

// ---- WordPress connector-plugin: entitlement ----

export type EntitlementStage = 'open' | 'register_prompt' | 'profile_prompt' | 'paid_lock';

export type ArticleEntitlement = {
  id: number;
  title: string;
  excerpt: string;
  isPremium: boolean;
  stage: EntitlementStage;
  remaining: number;
  isSubscriber: boolean;
  preview: string | null;
  content: string | null;
};
