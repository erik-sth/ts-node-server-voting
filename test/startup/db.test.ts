import mongoose from 'mongoose';
import { startDb, stopDB } from '../fakeDb';

jest.mock('mongoose');

describe('Database Connection', () => {
    it('should connect to the database', async () => {
        const mockConnect = jest.spyOn(mongoose, 'connect');
        await startDb();
        expect(mockConnect).toHaveBeenCalledWith(expect.any(String));
        stopDB();
    });
});
