import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  secret: (() => {
    const s = process.env.BETTER_AUTH_SECRET;
    if (s && s.length >= 32) return s;
    if (
      process.env.NODE_ENV === "production" &&
      process.env.VERCEL_ENV === "production"
    ) {
      throw new Error(
        "CRITICAL SECURITY: BETTER_AUTH_SECRET harus disetel dan minimal 32 karakter di production!"
      );
    }
    return "dev-only-secret-key-min-32-chars-long-local-2026";
  })(),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "buyer",
      },
      phone: {
        type: "string",
        required: false,
        defaultValue: "081234567890",
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "ACTIVE",
      },
      avatarUrl: {
        type: "string",
        required: false,
        defaultValue: "https://api.dicebear.com/10.x/adventurer-neutral/svg",
      },
      storeId: {
        type: "string",
        required: false,
      },
    },
  },
});
