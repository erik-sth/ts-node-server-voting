import express, { Request, Response } from 'express';
import { User, validateSchema } from '../models/user';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const { error } = validateSchema(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let user = await User.findOne({ email: req.body.email });
        if (user) return res.status(400).send('User already registered.');

        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        });

        await user.save();

        const token = user.generateAuthToken();
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            expires: oneWeekFromNow,
            signed: true,
        }).sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

router.post('/logout', (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 1,
        signed: true,
    }).sendStatus(200);
});

export default router;
