import express, { Request, Response } from 'express';
import logger from '../utils/logger';
const router = express.Router();

router.get('/', (_req: Request, res: Response) => {
    logger.debug('base route get request');
    res.status(200).send('OK');
});

export = router;
