/* eslint-disable quotes */
import express, { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { Contestant } from '../models/contestant';
import { Vote } from '../models/vote';
import { baseAccess } from '../middleware/baseAccess';
import { Project } from '../models/project';
import { isBetween } from '../utils/time';
import { io } from '../server';

const router = express.Router();

router.post(
    '/:projectId/:contestantId',
    async (req: Request, res: Response) => {
        const { contestantId, projectId } = req.params;

        // Validate project and contestant IDs
        if (!isValidObjectId(contestantId) || !isValidObjectId(projectId))
            return res.status(400).send('Invalid project or contestant Id.');

        // Check if project exists
        const project = await Project.findById(projectId);
        if (!project)
            return res.status(400).send("This project doesn't exist.");

        // Check voting time and admin logic
        if (!votingTimeAndAdminLogic(req, res, project)) return;

        // Check if contestant exists
        const contestant = await Contestant.findById(contestantId);
        if (!contestant)
            return res.status(400).send("This contestant doesn't exist.");

        const leftIp = getLeftIp(req);
        const limitVotesToOnePerIp = project.config.limitVotesToOnePerIp;

        // Check if votes are limited to one per IP+
        const duplicateVote = await Vote.findOne({
            publicIpAddress: leftIp,
            categories: contestant.categories,
            projectId,
        });
        const checkVote = limitVotesToOnePerIp ? duplicateVote : null;

        // Update contestant vote count and create new vote record
        if (!checkVote) contestant.voteCount += 1;
        else contestant.duplicateVoteCount += 1;

        const vote = new Vote({
            contestandId: contestantId,
            projectId,
            publicIpAddress: leftIp,
            categories: contestant.categories,
            duplicateVote: !!checkVote,
        });

        await vote.save();
        await contestant.save();
        pushChanges(vote, contestant, projectId);

        if (checkVote) return res.status(200).send('IpAddress already voted');
        return res.status(201).send('Voted!');
    }
);

router.get('/:projectId', baseAccess, async (req: Request, res: Response) => {
    const votes = await Vote.find({ projectId: req.params.projectId });
    res.send({ results: votes, count: votes.length });
});

function pushChanges(vote: Vote, contestant: Contestant, projectId: string) {
    io.to(projectId).emit('vote', {
        contestant,
        vote,
    });
}

function getLeftIp(req: Request) {
    const publicIp = req.headers['x-forwarded-for'];
    const leftIp =
        typeof publicIp === 'string' ? publicIp.split(',')[0] : 'unknown';
    return leftIp;
}

function votingTimeAndAdminLogic(
    req: Request,
    res: Response,
    project: Project
) {
    if (!project.config.useTime && !project.config.votingEnabled) {
        res.status(423).send(
            'Sorry, you cannot vote at the moment. Voting has been temporarily locked by the administrator. Please try again later.'
        );
        return false;
    }

    if (
        project.config.useTime &&
        !isBetween(
            new Date(project.config.votingStartDayAndTime),
            new Date(project.config.votingEndDayAndTime),
            new Date()
        )
    ) {
        const day = project.config.votingStartDayAndTime.getDate();
        const time = project.config.votingStartDayAndTime.getTime();
        res.status(423).send(
            `No Votes Allowed at the Moment. Votes begin ${day} at ${time}`
        );
        return false;
    }

    return true;
}

export default router;
