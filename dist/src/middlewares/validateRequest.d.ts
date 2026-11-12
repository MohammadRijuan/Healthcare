import z from "zod";
import { NextFunction, Request, Response } from "express";
export declare const validateRequest: (zodSchema: z.ZodObject) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=validateRequest.d.ts.map