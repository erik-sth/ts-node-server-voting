import express, { Request, Response } from 'express';
import { Project } from '../models/project';
import { isBetween } from '../utils/time';
import { isValidObjectId } from 'mongoose';
import { DateTime } from 'luxon'; // <-- added luxon

const router = express.Router();

router.get('/:projectId', async (req: Request, res: Response) => {
    if (!isValidObjectId(req.params.projectId))
        return res.status(400).send('Invalid project Id.');

    const project = await Project.findById(req.params.projectId).select({
        categories: true,
        config: true,
    });
    if (!project) return res.status(404).send('Project not found.');

    const now = DateTime.now().setZone('Europe/Berlin'); // <-- Berlin timezone

    if (
        project.config.useTime &&
        !isBetween(
            project.config.votingStartDayAndTime,
            project.config.votingEndDayAndTime,
            now.toJSDate() // because isBetween expects JS Date
        )
    )
        return res.status(403).send(returnMessage(project, now));

    res.send({
        categories: project.categories,
    });
});

function returnMessage(project: Project, now: DateTime) {
    const votingStart = DateTime.fromJSDate(
        project.config.votingStartDayAndTime
    ).setZone('Europe/Berlin');
    const votingEnd = DateTime.fromJSDate(
        project.config.votingEndDayAndTime
    ).setZone('Europe/Berlin');

    if (now < votingStart) {
        if (votingStart.weekday === now.weekday) {
            return `Abstimmung geöffnet ab ${votingStart.toFormat(
                'HH:mm'
            )} Uhr.`; // Only time
        }
        return `Abstimmung geöffnet ab ${votingStart.toFormat(
            'dd.MM.yyyy'
        )} um ${votingStart.toFormat('HH:mm')} Uhr.`; // Date + time
    }

    if (votingEnd < now) {
        if (votingEnd.weekday === now.weekday) {
            return `Abstimmung geschlossen seit ${votingEnd.toFormat(
                'HH:mm'
            )} Uhr.`; // Only time
        }
        return `Abstimmung geschlossen seit ${votingEnd.toFormat(
            'dd.MM.yyyy'
        )} um ${votingEnd.toFormat('HH:mm')} Uhr.`; // Date + time
    }
}

export default router;
