import express, { Request, Response } from 'express';
import { Project } from '../models/project';
import { isBetween } from '../utils/time';
import { isValidObjectId } from 'mongoose';

const router = express.Router();
router.get('/:projectId', async (req: Request, res: Response) => {
    if (!isValidObjectId(req.params.projectId))
        return res.status(400).send('Invalid project Id.');
    const project = await Project.findById(req.params.projectId).select({
        categories: true,
        config: true,
    });
    if (!project) return res.status(404).send('Project not found.');
    if (
        project.config.useTime &&
        !isBetween(
            project.config.votingStartDayAndTime,
            project.config.votingEndDayAndTime,
            new Date()
        )
    )
        return res
            .status(403)
            .send(
                `Voting disabled untill ${project?.config?.votingStartDayAndTime?.toDateString()} at ${project.config?.votingStartDayAndTime?.toLocaleTimeString()}.`
            );

    res.send({
        categories: project.categories,
    });
});

export default router;
