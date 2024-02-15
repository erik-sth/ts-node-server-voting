import express, { Request, Response } from 'express';
import { Project, validateSchema } from '../models/project';
import { Types, isValidObjectId } from 'mongoose';

const router = express.Router();
router.get('/:projectId?', async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const query: { _id?: string } = {};
    if (projectId && !isValidObjectId(projectId))
        return res.status(400).send('Invalid ObjectId.');
    else if (projectId) query._id = projectId;

    const projects = await Project.find(query);
    res.send({ results: projects, count: projects.length });
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
    });
    newProject.save();

    res.send(newProject).status(201);
});

export default router;
