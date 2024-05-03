import { Express, Request, Response } from 'express';
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

    app.use(limiter);
};

export default addRateLimiter;
