import { Express, Request, Response, NextFunction } from 'express';
import RateLimit, { Options } from 'express-rate-limit';
import { getLeftIp } from '../routes/voting';

interface ExtendedOptions extends Options {
    trustProxy?: boolean;
}

const addRateLimiter = async (app: Express) => {
    const limiter = RateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // max 100 requests per windowMs
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        keyGenerator: function (req: Request, _res: Response) {
            console.log(getLeftIp(req));
            return getLeftIp(req);
        },
    } as ExtendedOptions);

    // Custom middleware to log rate limiting key and client's IP address
    // app.use(async (req: Request, res: Response, next: NextFunction) => {
    //     const clientIP = req.ip; // Get client's IP address
    //     const key = await limiter.getKey(clientIP);
    //     console.log(`Rate limiting key: ${key}, Client IP: ${clientIP}`);
    //     next();
    // });

    app.use(limiter);
};

export default addRateLimiter;
