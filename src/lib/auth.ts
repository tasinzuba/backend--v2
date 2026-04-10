import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins";
import { prisma } from "./prisma.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email.js";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    baseURL: process.env.BETTER_AUTH_URL,
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        },
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url }) => {
            await sendPasswordResetEmail(user.email, url);
        },
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
            const vUrl = new URL(url);
            vUrl.searchParams.set("callbackURL", frontendUrl + "/login?message=Email verified successfully!");
            await sendVerificationEmail(user.email, vUrl.toString());
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60
        }
    },
    trustedOrigins: [
        "https://frontend-one-orpin-24.vercel.app",
        "https://frontend-v2-kappa-eight.vercel.app",
        process.env.FRONTEND_URL,
    ].filter(Boolean) as string[],
    advanced: {
        useSecureCookies: true,
        cookiePrefix: "better-auth",
        crossSubDomainCookies: {
            enabled: false,
        },
        cookieOptions: {
            sameSite: "none",
            secure: true,
            httpOnly: true,
        },
        disableCSRFCheck: true,
    },
    plugins: [
        bearer()
    ],
    user: {
        additionalFields: {
            role: { type: "string", defaultValue: "CUSTOMER" },
            status: { type: "string", defaultValue: "ACTIVE" },
            phone: { type: "string", required: false },
        }
    }
});
