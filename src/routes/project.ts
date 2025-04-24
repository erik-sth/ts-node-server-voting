import express, { Request, Response } from 'express';
import { Project, validateSchema } from '../models/project';
import { AuthenticatedRequest, baseAccess } from '../middleware/baseAccess';
import { Contestant } from '../models/contestant';
import { Vote } from '../models/vote';
import { io } from '../server';
import { auth } from '../middleware/auth';
import { User } from '../models/user';
import { ownerAccess } from '../middleware/ownerAccess';
import { AuthenticatedPaginatedRequest } from '../types/Request.types';
import { paginate } from '../middleware/paginate';

const router = express.Router();

router.get(
    '/',
    auth,
    paginate,
    async (req: AuthenticatedPaginatedRequest, res: Response) => {
        let projects = [];
        let count = 0;
        if (req.user.isAdmin) {
            projects = await Project.find().limit(req.limit).skip(req.skip);
            count = await Project.countDocuments();
        }
        if (!req.user.isAdmin) {
            const user = await User.findById(req.user._id).select({
                projects: 1,
            });
            projects = await Project.find({ _id: { $in: user.projects } })
                .limit(req.limit)
                .skip(req.skip);
            count = user.projects.length;
        }
        res.send({ results: projects, count });
    }
);

router.get(
    '/:projectId',
    [auth, baseAccess],
    async (req: Request, res: Response) => {
        const { projectId } = req.params;
        const project = await Project.findById(projectId);
        const contestants = await Contestant.find({ projectId: projectId });
        const votes = await Vote.find({ projectId: projectId });
        res.send({ project: project, contestants: contestants, votes: votes });
    }
);

router.post('/', auth, async (req: AuthenticatedRequest, res: Response) => {
    const error = validateSchema(req.body);
    if (error) return res.status(400).send(error.message);

    const project = await Project.findOne({ name: req.body.name }).lean();
    if (project) return res.status(400).send('Project already exists.');

    const newProject = new Project({
        name: req.body.name,
        owner: req.user._id,
        config: req.body.config,
        categories: req.body.categories,
    });
    const savedProject = await newProject.save();
    await User.findByIdAndUpdate(req.user._id, {
        $push: { projects: savedProject._id },
    });
    res.status(201).send(newProject);
});

router.put(
    '/lock/:projectId',
    [auth, baseAccess],
    async (req: Request, res: Response) => {
        const project = await Project.findById(req.params.projectId);
        project.config.votingEnabled = false;
        project.save();
        io.to(req.params.projectId).emit('project', project);
        res.send('Locked Voting.');
    }
);
router.put(
    '/unlock/:projectId',
    [auth, baseAccess],
    async (req: Request, res: Response) => {
        const project = await Project.findById(req.params.projectId);
        project.config.votingEnabled = true;
        project.save();
        io.to(req.params.projectId).emit('project', project);
        res.send('Unlocked Voting.');
    }
);
router.put(
    '/admin/:projectId',
    [auth, baseAccess],
    async (req: Request, res: Response) => {
        const project = await Project.findById(req.params.projectId);
        project.config.useTime = false;
        project.save();
        io.to(req.params.projectId).emit('project', project);
        res.send('Admin controlled Voting.');
    }
);

router.put(
    '/useTime/:projectId',
    [auth, baseAccess],
    async (req: Request, res: Response) => {
        const project = await Project.findById(req.params.projectId);
        project.config.useTime = true;
        project.save();
        io.to(req.params.projectId).emit('project', project);
        res.send('Timed controlled Voting.');
    }
);
router.put(
    '/reset/:projectId',
    [auth, ownerAccess],
    async (req: Request, res: Response) => {
        const { projectId } = req.params;

        // Reset contestants' countedVotes to 0
        await Contestant.updateMany(
            { projectId: projectId },
            { voteCount: 0, duplicateVoteCount: 0 }
        );

        // Find contestantsIds after resetting
        const contestants = await Contestant.find({
            projectId: projectId,
        });
        const contestantsIds = contestants.map((c) => c._id);
        // Delete votes associated with the contestants
        await Vote.deleteMany({
            contestantId: { $in: contestantsIds },
        });
        return res.status(202).send('Reseted project.');
    }
);
router.put(
    '/time/:projectId',
    [auth, baseAccess],
    async (req: Request, res: Response) => {
        const project = await Project.findById(req.params.projectId);
        project.config.votingStartDayAndTime =
            req.body.config.votingStartDayAndTime;
        project.config.votingEndDayAndTime =
            req.body.config.votingEndDayAndTime;
        project.save();
        io.to(req.params.projectId).emit('project', project);
        res.send('Time updated.');
    }
);

router.delete(
    '/:projectId',
    [auth, ownerAccess],
    async (req: AuthenticatedRequest, res: Response) => {
        const { projectId } = req.params;

        // Find contestantsIds after resetting
        const contestants = await Contestant.find({
            projectId: projectId,
        });
        const contestantsIds = contestants.map((c) => c._id);
        await Contestant.deleteMany({ projectId: projectId });
        // Delete votes associated with the contestants
        await Vote.deleteMany({ contestantId: { $in: contestantsIds } });
        await Project.findByIdAndDelete(req.params.projectId);
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { projects: projectId },
        });

        res.send('Deleted project.').status(202);
    }
);

export default router;
