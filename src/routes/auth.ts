import bcrypt from 'bcrypt';
import { User } from '../models/user';
import express, { Request, Response } from 'express';
import Joi from 'joi';
import logger from '../utils/logger';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const error = await validateRequest(req);
        if (error) return res.send(error.message).status(400);

        req.body.email = req.body.email.toLowerCase();
        const user = await findUserByEmail(req.body.email);

        if (!user) {
            return res.status(400).send('Invalid email or password.');
        }

        await handlePasswordValidation(req.body.password, user);

        const token = user.generateAuthToken();

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
        }).sendStatus(200);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

async function validateRequest(req: Request) {
    const schema = Joi.object({
        email: Joi.string().email().required().max(255).label('Email'),
        password: Joi.string().min(5).max(255).required().label('Password'),
    });

    const { error } = schema.validate({
        email: req.body.email,
        password: req.body.password,
    });
    return error;
}

async function findUserByEmail(email: string) {
    return await User.findOne({ email });
}

async function handlePasswordValidation(password: string, user: User) {
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
        logger.error('password problem');
        throw new Error('Invalid email or password.');
    }
}

export default router;
