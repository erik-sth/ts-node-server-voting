import { Express } from 'express';
import RateLimit, { Options } from 'express-rate-limit';

interface ExtendedOptions extends Options {
    trustProxy?: boolean;
}

const addRateLimiter = async (app: Express) => {
    const limiter = RateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // max 100 requests per windowMs
        headers: true,
        trustProxy: true,
    } as ExtendedOptions);

    app.use(limiter);
};

export default addRateLimiter;
