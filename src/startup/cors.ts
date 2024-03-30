import cors, { CorsOptions } from 'cors';
import { Express } from 'express';

export function configureCors(app: Express) {
    // Cross-Origin Resource Sharing
    const origins =  process.env.ORIGIN.split(',');
    const corsOptions: CorsOptions = {
        origin: [...origins],
        methods: ['GET', 'PATCH', 'DELETE', 'PUT', 'POST'],
        allowedHeaders: ['Content-Type', 'Access-Control-Allow-Credentials'],
        maxAge: 600,
        credentials: true,
    };

    app.use(cors(corsOptions));
}
