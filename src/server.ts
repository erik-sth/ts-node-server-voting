import express, { Express } from 'express';
import { configureCors } from './startup/cors';
import base from './routes/base';
import project from './routes/project';
import contestant from './routes/contestant';
import vote from './routes/voting';
import addRateLimiter from './startup/limitRate';
import * as dotenv from 'dotenv';
import logger from './utils/logger';
import { testingConfig } from './startup/testing';
import connectToDatabase from './startup/db';
dotenv.config();

const app: Express = express();

app.set('trustProxy', true);

// Other startup configurations
configureCors(app);
addRateLimiter(app);
connectToDatabase();
testingConfig();

app.use(express.json());
app.use('/', base);
app.use('/project', project);
app.use('/contestant', contestant);
app.use('/vote', vote);

const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const server = app.listen(port, '0.0.0.0', () => {
    logger.info('Server started on port: ' + port);
});

export { server };
