import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins";
import { prisma } from "./prisma.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email.js";

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    baseURL: process.env.BETTER_AUTH_URL,
    basePath: "/api/auth",
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
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
        "https://medistore-frontend-brown.vercel.app",
        frontendUrl,
    ].filter(Boolean) as string[],
    advanced: {
        useSecureCookies: true,
        cookiePrefix: "better-auth",
        crossSubDomainCookies: {
            enabled: false,
        },
        defaultCookieAttributes: {
            sameSite: "none",
            secure: true,
            httpOnly: true,
            path: "/",
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
