import { Express } from 'express';
import RateLimit from 'express-rate-limit';

const addRateLimiter = async (app: Express) => {
    const limiter = RateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // max 100 requests per windowMs
    });

    app.use(limiter);
};
export default addRateLimiter;
