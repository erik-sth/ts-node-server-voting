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
        res.cookie('token', token, {
            httpOnly: true,
            secure: true /* set to true if your site uses HTTPS */,
            sameSite: 'strict',
        }).sendStatus(200);
        res.header('x-auth-token', token).send({
            _id: user._id,
            name: user.name,
            email: user.email,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

export default router;
