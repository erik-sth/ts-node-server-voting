import express, { Request, Response } from 'express';
import { Contestant, validateSchema } from '../models/contestant';
import { baseAccess } from '../middleware/baseAccess';
import { Project } from '../models/project';

const router = express.Router();
router.get('/:projectId', baseAccess, async (req: Request, res: Response) => {
    const contestant = await Contestant.find({
        projectId: req.params.projectId,
    }).select({ categories: true, name: true, _id: true });
    const project = await Project.findById(req.params.projectId);
    res.send({
        project: project,
        results: contestant,
        count: contestant.length,
    });
});

router.get(
    '/admin/:projectId',
    baseAccess,
    async (req: Request, res: Response) => {
        const contestant = await Contestant.find({
            projectId: req.params.projectId,
        });

        res.send({
            results: contestant,
            count: contestant.length,
        });
    }
);

router.post('/:projectId', baseAccess, async (req: Request, res: Response) => {
    const error = validateSchema(req.body);
    if (error) return res.status(400).send(error.message);

    const { projectId } = req.params;
    const { categories, name } = req.body;
    const project = await Contestant.findOne({
        name: req.body.namem,
        categories: req.body.categories,
        _id: projectId,
    });
    if (project) return res.status(400).send('Contestant already exists.');

    const newContestant = new Contestant({
        name: name,
        categories: categories,
        projectId: projectId,
    });

    newContestant.save();

    res.send(newContestant).status(201);
});

router.delete(
    '/:projectId/:contestant',
    baseAccess,
    async (req: Request, res: Response) => {
        await Contestant.findByIdAndDelete(req.params.contestant);
        res.send('Deleted contestant.').status(202);
    }
);

export default router;
