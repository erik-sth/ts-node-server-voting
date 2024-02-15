import express, { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { Contestant, validateSchema } from '../models/contestant';
import { baseAccess } from '../middleware/baseAccess';

const router = express.Router();
router.get('/:projectId', baseAccess, async (req: Request, res: Response) => {
    const contestant = await Contestant.find({
        projectId: req.params.projectId,
    }).select({ gender: true, name: true, _id: true });
    res.send({ results: contestant, count: contestant.length });
});

router.get(
    '/admin/:projectId',
    baseAccess,
    async (req: Request, res: Response) => {
        const contestant = await Contestant.find({
            projectId: req.params.projectId,
        });
        res.send({ results: contestant, count: contestant.length });
    }
);

router.post('/:projectId', baseAccess, async (req: Request, res: Response) => {
    const error = validateSchema(req.body);
    if (error) return res.status(400).send(error.message);

    const project = await Contestant.findOne({
        name: req.body.namem,
        _id: req.params.projectId,
        gender: req.body.gender,
    });
    if (project) return res.status(400).send('Contestant already exists.');

    if (!isValidObjectId(req.params.projectId))
        return res.send('Invalid Project Id.').status(400);

    const newContestant = new Contestant({
        name: req.body.name,
        gender: req.body.gender,
        projectId: req.params.projectId,
    });
    newContestant.save();

    res.send(newContestant).status(201);
});

export default router;
