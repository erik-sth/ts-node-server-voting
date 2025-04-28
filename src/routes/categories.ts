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
        return res.status(403).send(returnMessage(project));

    res.send({
        categories: project.categories,
    });
});
function returnMessage(project: Project) {
    if (new Date() < project.config.votingStartDayAndTime) {
        if (
            project.config.votingStartDayAndTime.getDay() == new Date().getDay()
        ) {
            return `Abstimmung geöffnet ab ${project.config.votingStartDayAndTime.toLocaleTimeString()}.`;
        }
        return `Abstimmung geöffnet ab ${project.config.votingStartDayAndTime.toLocaleDateString()} um ${project.config?.votingStartDayAndTime?.toLocaleTimeString()}.`;
    }
    if (project.config.votingEndDayAndTime < new Date()) {
        if (
            project.config.votingEndDayAndTime.getDay() == new Date().getDay()
        ) {
            return `Abstimmung geschlossen seit ${project.config?.votingEndDayAndTime?.toLocaleTimeString()}.`;
        }
        return `Abstimmung geschlossen seit ${project.config.votingEndDayAndTime.toLocaleDateString()} um ${project.config?.votingEndDayAndTime?.toLocaleTimeString()}.`;
    }
}

export default router;
