import { Response, NextFunction } from 'express';
import  { isValidObjectId } from 'mongoose';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../types/Request.types';
import { Project } from '../models/project';

const ownerAccess = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {

        const projectId = req.params.projectId;

        if (!projectId || !isValidObjectId(projectId)) {
            throw new Error('Invalid or missing projectId parameter');
        }
        if (req.user.isAdmin) return next();
        const foundProject = await Project.findById(projectId);

        if (!foundProject) {
            throw new Error('Project not found');
        }

        if (foundProject.owner.equals(req.user._id)) {
            next();
        } else {
            throw new Error('No access to this project');
        }
    } catch (error) {
        logger.debug(`Error in ownerAccess middleware: ${error.message}`);
        res.status(403).send('Access forbidden: ' + error.message);
    }
};

export { ownerAccess };
