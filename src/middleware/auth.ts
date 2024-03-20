import { Response, NextFunction } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { getJWTSecret } from '../utils/jwt';
import logger from '../utils/logger';
import { AuthenticatedRequest, UserTokenData } from '../types/Request.types';

const auth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.signedCookies?.token;

    if (!token) {
        logger.debug('No token found in request');
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, getJWTSecret()) as UserTokenData;
        req.user = decoded;

        next();
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            logger.debug('Token expired', error);
            return res.status(401).json({ message: 'Token expired' });
        } else {
            logger.error('Token verification failed', error);
            return res.status(401).json({ message: 'Unauthorized' });
        }
    }
};

export { auth };
