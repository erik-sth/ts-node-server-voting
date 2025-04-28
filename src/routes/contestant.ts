import express, { Request, Response } from 'express';
import { Contestant, validateSchema } from '../models/contestant';
import { baseAccess } from '../middleware/baseAccess';
import { Project } from '../models/project';
import { isBetween } from '../utils/time';
import { auth } from '../middleware/auth';
import { isValidObjectId } from 'mongoose';

const router = express.Router();
router.get('/:projectId', async (req: Request, res: Response) => {
    if (!isValidObjectId(req.params.projectId))
        return res.status(400).send('Invalid project Id.');
    const project = await Project.findById(req.params.projectId).select({
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
                `Voting disabled until ${project?.config?.votingStartDayAndTime?.toLocaleDateString()} at ${project.config?.votingStartDayAndTime?.toLocaleTimeString()}.`
            );
    const contestant = await Contestant.find({
        projectId: req.params.projectId,
    }).select({ categories: true, name: true, _id: true });

    res.send({
        results: contestant,
        count: contestant.length,
    });
});

router.post(
    '/:projectId',
    auth,
    baseAccess,
    async (req: Request, res: Response) => {
        const error = validateSchema(req.body);
        if (error) return res.status(400).send(error.message);

        const { projectId } = req.params;
        const { categories, name } = req.body;
        const contestant = await Contestant.findOne({
            name: req.body.name,
            projectId: projectId,
        }).lean();
        if (contestant)
            return res.status(400).send('Contestant already exists.');

        const newContestant = new Contestant({
            name: name,
            categories: categories,
            projectId: projectId,
        });

        newContestant.save();

        res.send(newContestant).status(201);
    }
);

router.delete(
    '/:projectId/:contestant',
    auth,
    baseAccess,
    async (req: Request, res: Response) => {
        if (!isValidObjectId(req.params.contestant))
            return res.status(400).send('Invalid contestant id.');
        await Contestant.findByIdAndDelete(req.params.contestant);
        res.send('Deleted contestant.').status(202);
    }
);

export default router;
