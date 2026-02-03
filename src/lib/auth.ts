import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email.js";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
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
        process.env.FRONTEND_URL || "http://localhost:3000",
    ],
    advanced: {
        useSecureCookies: process.env.NODE_ENV === "production",
        cookiePrefix: "better-auth",
        crossSubDomainCookies: {
            enabled: false,
        },
        disableCSRFCheck: true,
    },
    user: {
        additionalFields: {
            role: { type: "string", defaultValue: "CUSTOMER" },
            status: { type: "string", defaultValue: "ACTIVE" },
            phone: { type: "string", required: false },
        }
    }
});
