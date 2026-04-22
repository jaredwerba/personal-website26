import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { sendMagicLinkEmail } from "@/lib/email";

const isProd = process.env.NODE_ENV === "production";
const prodHost = process.env.NEXT_PUBLIC_SITE_HOST || "jwerba.com";
const prodOrigin = `https://${prodHost}`;

// Origins that are allowed to call the auth API. Better-auth rejects any
// request whose `Origin` header isn't in this list with "Invalid origin".
// Apex + www cover canonical prod; *.vercel.app unblocks preview deploys
// (passkeys still won't work there — rpID is bound to jwerba.com — but the
// magic-link / session endpoints will, which is enough for smoke-testing).
const trustedOrigins = isProd
  ? [
      prodOrigin,
      `https://www.${prodHost}`,
      "https://*.vercel.app",
    ]
  : ["http://localhost:3000"];

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      passkey: schema.passkey,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: isProd ? prodOrigin : "http://localhost:3000",
  trustedOrigins,
  emailAndPassword: {
    // Required by the passkey flow: we create the user row via
    // signUp.email(auto-random-password) and then attach a passkey.
    enabled: true,
    autoSignIn: true,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
  },
  plugins: [
    passkey({
      rpName: "jwerba",
      rpID: isProd ? prodHost : "localhost",
      // No explicit `origin` → the plugin falls back to the request's Origin
      // header, so a passkey created on www.jwerba.com verifies correctly
      // (and vice versa) as long as rpID remains the apex.
    }),
    magicLink({
      // Account recovery only — user must already exist (passkey lost/replaced).
      disableSignUp: true,
      expiresIn: 60 * 10, // 10 minutes
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail(email, url);
      },
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
