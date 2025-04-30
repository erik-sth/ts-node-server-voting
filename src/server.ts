import express, { Express } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { configureCors } from './startup/cors';
import base from './routes/base';
import project from './routes/project';
import contestant from './routes/contestant';
import vote from './routes/voting';
import * as dotenv from 'dotenv';
import logger from './utils/logger';
import { testingConfig } from './startup/testing';
import connectToDatabase from './startup/db';
import auth from './routes/auth';
import user from '../src/routes/user';
import cookieParser from 'cookie-parser'; // Import cookie-parser
import config from './startup/config';
import categories from './routes/categories';
import addRateLimiter from './startup/limitRate';

dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: process.env.ORIGIN_ADMIN, methods: ['GET', 'POST'] },
});

app.set('trustProxy', true);
config();

// Other startup configurations
configureCors(app);
connectToDatabase();
testingConfig();
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use('/', base);
app.use('/project', project);
app.use('/contestant', contestant);
app.use('/vote', vote);
app.use('/auth', auth);
app.use('/user', user);
app.use('/categories', categories);

// Socket.IO integration
app.set('io', io);

io.on('connection', (socket) => {
    socket.on('join', ({ projectId }) => {
        // Join the room for the specific projectId
        socket.join(projectId);
    });
});

const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

server.listen(port, '0.0.0.0', () => {
    logger.info('Server started on port: ' + port);
});

export { server, io };
