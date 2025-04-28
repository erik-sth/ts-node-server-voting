import express, { Request, Response } from 'express';
import { Contestant, validateSchema } from '../models/contestant';
import { baseAccess } from '../middleware/baseAccess';
import { Project } from '../models/project';
import { isBetween } from '../utils/time';
import { auth } from '../middleware/auth';
import { isValidObjectId } from 'mongoose';
import { DateTime } from 'luxon'; // <-- added luxon

const router = express.Router();

router.get('/:projectId', async (req: Request, res: Response) => {
    if (!isValidObjectId(req.params.projectId))
        return res.status(400).send('Invalid project Id.');

    const project = await Project.findById(req.params.projectId).select({
        config: true,
    });
    if (!project) return res.status(404).send('Project not found.');

    const now = DateTime.now().setZone('Europe/Berlin'); // <-- current Berlin time

    if (
        project.config.useTime &&
        !isBetween(
            project.config.votingStartDayAndTime,
            project.config.votingEndDayAndTime,
            now.toJSDate() // isBetween expects JS Date
        )
    )
        return res
            .status(403)
            .send(
                `Voting disabled until ${formatDate(
                    project.config.votingStartDayAndTime
                )} at ${formatTime(project.config.votingStartDayAndTime)}.`
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
            name: name,
            projectId: projectId,
        }).lean();
        if (contestant)
            return res.status(400).send('Contestant already exists.');

        const newContestant = new Contestant({
            name: name,
            categories: categories,
            projectId: projectId,
        });

        await newContestant.save(); // <-- small fix: should `await` save()

        res.status(201).send(newContestant); // <-- correct order: set status BEFORE send
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
        res.status(202).send('Deleted contestant.'); // <-- correct order
    }
);

export default router;

// Small helpers to format times nicely in Berlin timezone:

function formatDate(date: Date): string {
    return DateTime.fromJSDate(date)
        .setZone('Europe/Berlin')
        .toFormat('dd.MM.yyyy');
}

function formatTime(date: Date): string {
    return DateTime.fromJSDate(date).setZone('Europe/Berlin').toFormat('HH:mm');
}
