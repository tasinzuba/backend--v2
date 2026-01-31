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
            const frontendUrl = "https://frontend-loz9g3ebd-tasinbis-projects.vercel.app";
            const urlObj = new URL(url);
            urlObj.searchParams.set("callbackURL", `${frontendUrl}/login?message=Email verified successfully!`);
            await sendVerificationEmail(user.email, urlObj.toString());
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
    },
    trustedOrigins: [
        "https://frontend-loz9g3ebd-tasinbis-projects.vercel.app"
    ],
    advanced: {
        useSecureCookies: true,
        cookieSameSite: "None"
    },
    user: {
        additionalFields: {
            role: { type: "string", defaultValue: "CUSTOMER" },
        }
    }
});
