import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { error } from "../utils/response";

export const validate = (schema: ZodSchema) => (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        req.body = schema.parse(req.body);
        next();
    } catch (e: any) {
        const message = e.errors?.[0]?.message || "Validation failed";
        res.status(400).json(error(message));
    }
};
