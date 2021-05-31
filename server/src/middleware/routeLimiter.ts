import { Request, Response, NextFunction } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";

const opts = {
    points: 1, // 6 points
    duration: 10, // Per second
};

const rateLimiter = new RateLimiterMemory(opts);
const routeLimiter = (req: Request, res: Response, next: NextFunction) => {
    rateLimiter.consume(req.ip)
        .then(() => {
            return true;
        })
        .catch(_ => {
            return false;
        });
};

export { routeLimiter }; // TODO: remove this?
