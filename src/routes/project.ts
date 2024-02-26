import express, { Request, Response } from 'express';
import { Project, validateSchema } from '../models/project';
import { Types } from 'mongoose';
import { baseAccess } from '../middleware/baseAccess';
import { Contestant } from '../models/contestant';
import { Vote } from '../models/vote';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const query: { _id?: string } = {};

    if (projectId) query._id = projectId;

    const projects = await Project.find(query);
    res.send({ results: projects, count: projects.length });
});

router.get('/:projectId', baseAccess, async (req: Request, res: Response) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    const contestants = await Contestant.find({ projectId: projectId });
    const votes = await Vote.find({ projectId: projectId });
    res.send({ project: project, contestants: contestants, votes: votes });
});

router.post('/', async (req: Request, res: Response) => {
    const error = validateSchema(req.body);
    if (error) return res.status(400).send(error.message);

    const project = await Project.findOne({ name: req.body.name });
    if (project) return res.status(400).send('Project already exists.');

    const newProject = new Project({
        name: req.body.name,
        owner: new Types.ObjectId(),
        config: req.body.config,
        categories: req.body.categories,
    });

    await newProject.save();

    res.status(201).send(newProject);
});

router.put(
    '/reset/:projectId',
    baseAccess,
    async (req: Request, res: Response) => {
        const { projectId } = req.params;

        // Reset contestants' countedVotes to 0
        await Contestant.updateMany(
            { projectId: projectId },
            { countedVotes: 0 }
        );

        // Find contestantsIds after resetting
        const contestants = await Contestant.find({
            projectId: projectId,
        });
        const contestantsIds = contestants.map((c) => c._id);
        // Delete votes associated with the contestants
        await Vote.deleteMany({
            contestandId: { $in: contestantsIds },
        });
        return res.status(202).send('Reseted project.');
    }
);

router.put(
    '/lock/:projectId',
    baseAccess,
    async (req: Request, res: Response) => {
        const project = await Project.findById(req.params.projectId);
        project.config.votingEnabled = false;
        project.save();
        res.send('Locked Voting.');
    }
);

router.put(
    '/unlock/:projectId',
    baseAccess,
    async (req: Request, res: Response) => {
        const project = await Project.findById(req.params.projectId);
        project.config.votingEnabled = true;
        project.save();
        res.send('Unlocked Voting.');
    }
);

router.delete(
    '/:projectId',
    baseAccess,
    async (req: Request, res: Response) => {
        const { projectId } = req.params;

        // Reset contestants' countedVotes to 0
        await Contestant.updateMany(
            { projectId: projectId },
            { countedVotes: 0 }
        );

        // Find contestantsIds after resetting
        const contestants = await Contestant.find({
            projectId: projectId,
        });
        const contestantsIds = contestants.map((c) => c._id);
        await Contestant.deleteMany({ projectId: projectId });
        // Delete votes associated with the contestants
        await Vote.deleteMany({ contestantId: { $in: contestantsIds } });
        await Project.findByIdAndDelete(req.params.projectId);

        res.send('Deleted project.').status(202);
    }
);

export default router;
