import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email.js";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    baseURL: "https://backend-v2-sb9v.vercel.app",
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
            const verificationUrl = `${url}&callbackURL=${encodeURIComponent(frontendUrl + "/login?message=Email verified successfully!")}`;
            await sendVerificationEmail(user.email, verificationUrl);
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
        "https://frontend-v2-theta-two.vercel.app",
        "https://frontend-loz9g3ebd-tasinbis-projects.vercel.app"
    ],
    advanced: {
        useSecureCookies: true,
        cookiePrefix: "medistore",
        cookieSameSite: "None",
        crossTabSessionSync: true
    },
    user: {
        additionalFields: {
            role: { type: "string", defaultValue: "CUSTOMER" },
            status: { type: "string", defaultValue: "ACTIVE" },
            phone: { type: "string", required: false },
        }
    }
});
