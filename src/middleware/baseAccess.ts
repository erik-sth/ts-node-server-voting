import { Response, NextFunction } from 'express';
import mongoose from 'mongoose'; // Import mongoose
import logger from '../utils/logger';
import { User } from '../models/user';
import { AuthenticatedRequest } from '../types/Request.types';

const baseAccess = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (req.user.isAdmin) return next();
        if (
            req.params &&
            req.params.projectId &&
            mongoose.isValidObjectId(req.params.projectId) // Use mongoose.isValidObjectId
        ) {
            const projectId: mongoose.Types.ObjectId =
                new mongoose.Types.ObjectId(req.params.projectId); // Use mongoose.Schema.Types.ObjectId
            const user = req.user; // Simplify the user retrieval
            if (user && user._id) {
                const foundUser = await User.findById(user._id).select({
                    projects: 1,
                });
                if (foundUser && foundUser.projects.includes(projectId)) {
                    next();
                } else {
                    throw new Error('No access to this project');
                }
            } else {
                throw new Error(
                    'User not authenticated or missing _id property'
                );
            }
        } else {
            throw new Error('projectId parameter is missing or invalid');
        }
    } catch (error) {
        logger.debug(`Invalid ObjectId: ${error.message}`);
        res.status(400).send('Invalid objectId or insufficient access.');
    }
};

export { baseAccess, AuthenticatedRequest };
