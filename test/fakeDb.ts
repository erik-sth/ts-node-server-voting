import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const db = new MongoMemoryServer();

async function startDb() {
    await db.start();
    const mongoURI = db.getUri();
    await mongoose.connect(mongoURI);
}

async function stopDB() {
    await mongoose.disconnect();
    await db.stop();
}

export { startDb, stopDB };
