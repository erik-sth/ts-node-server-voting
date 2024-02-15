import { Request, Response, NextFunction } from 'express';
import { isValidObjectId } from 'mongoose';
import logger from '../utils/logger';

const baseAccess = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (
            req.params &&
            req.params.projectId &&
            isValidObjectId(req.params.projectId)
        ) {
            next();
        } else {
            throw new Error('projectId parameter is missing');
        }
    } catch (error) {
        logger.debug('Invalid ObjectId');
        res.send('Invalid objectId.').status(400);
    }
};

export { baseAccess };
