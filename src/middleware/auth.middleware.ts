import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
    session?: {
        id: string;
        userId: string;
        expiresAt: Date;
        [key: string]: any;
    };
}

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session) {
            return res.status(401).json({ success: false, error: "Unauthorized" });
        }

        req.user = session.user as any;
        req.session = session.session;
        next();
    } catch {
        res.status(401).json({ success: false, error: "Invalid session" });
    }
};

export const requireAuth = authMiddleware;

export const roleMiddleware = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: "Unauthorized" });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: "Forbidden" });
        }

        next();
    };
};
