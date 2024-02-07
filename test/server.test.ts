import supertest, { SuperTest, Test } from 'supertest';
import { server } from '../src/server';
import { startDb, stopDB } from './fakeDb';

describe('Server Tests', () => {
    let app: SuperTest<Test>;

    beforeAll(async () => {
        app = supertest(server);
        await startDb();
    });

    afterAll(async () => {
        server.close();
        await stopDB();
    });

    it('should respond with status 200 for the root route', async () => {
        const response = await app.get('/');
        expect(response.status).toBe(200);
    });
});
