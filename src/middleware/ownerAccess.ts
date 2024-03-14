import { Response, NextFunction } from 'express';
import mongoose from 'mongoose'; // Import mongoose
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../types/Request.types';
import { Project } from '../models/project';

const ownerAccess = async (
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
                const foundProject = await Project.findById(projectId);
                if (foundProject && foundProject.owner == req.user._id) {
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

export { ownerAccess };
