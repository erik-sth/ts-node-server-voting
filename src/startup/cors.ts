// ./startup/cors.ts
import cors, { CorsOptions } from 'cors';
import { Express } from 'express';

export function configureCors(app: Express) {
    // Cross-Origin Resource Sharing
    const corsOptions: CorsOptions = {
        origin: process.env.ORIGIN,
        methods: ['GET', 'PATCH', 'DELETE', 'PUT', 'POST'],
        allowedHeaders: [],
        maxAge: 600,
    };

    app.use(cors(corsOptions));
}
