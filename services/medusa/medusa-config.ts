import { defineConfig, loadEnv } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

function toBoolean(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

const stripeCapture = toBoolean(process.env.STRIPE_CAPTURE);

const paymentModules = process.env.STRIPE_API_KEY
  ? [
      {
        resolve: "@medusajs/medusa/payment",
        options: {
          providers: [
            {
              resolve: "@medusajs/payment-stripe",
              id: "stripe",
              options: {
                apiKey: process.env.STRIPE_API_KEY,
                webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
                capture: stripeCapture,
              },
            },
          ],
        },
      },
    ]
  : [];

const reverseChargeTaxModules = [
  {
    resolve: "@medusajs/medusa/tax",
    options: {
      providers: [
        {
          resolve: "./src/modules/tax/providers/eu-reverse-charge",
          id: "vies",
        },
      ],
    },
  },
];

const customModules = [
  {
    resolve: "./src/modules/lead",
  },
  {
    resolve: "./src/modules/traffic-hit",
  },
  {
    resolve: "./src/modules/email-template",
  },
];

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: (() => {
        const secret = process.env.JWT_SECRET;
        if (!secret || secret === "supersecret") {
          throw new Error(
            "JWT_SECRET must be set to a strong, random value. Generate one with: node -e \"console.log(require('crypto').randomBytes(48).toString('base64'))\"",
          );
        }
        return secret;
      })(),
      cookieSecret: (() => {
        const secret = process.env.COOKIE_SECRET;
        if (!secret || secret === "supersecret") {
          throw new Error(
            "COOKIE_SECRET must be set to a strong, random value. Generate one with: node -e \"console.log(require('crypto').randomBytes(48).toString('base64'))\"",
          );
        }
        return secret;
      })(),
    },
  },
  modules: [...customModules, ...reverseChargeTaxModules, ...paymentModules],
});
