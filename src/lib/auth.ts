import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email.js";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
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
            const urlObj = new URL(url);
            urlObj.searchParams.set("callbackURL", `${frontendUrl}/login?message=Email verified successfully!`);
            await sendVerificationEmail(user.email, urlObj.toString());
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
    trustedOrigins: [process.env.FRONTEND_URL!, "http://localhost:3000"],
    advanced: {
        useSecureCookies: true,
    },
    secondaryStorage: {
        get: async (key) => null,
        set: async (key, value) => { },
        delete: async (key) => { }
    },
    user: {
        additionalFields: {
            role: { type: "string", defaultValue: "CUSTOMER" },
            status: { type: "string", defaultValue: "ACTIVE" },
            phone: { type: "string", required: false },
        }
    }
});
