import mongoose from 'mongoose';
import logger from '../utils/logger';

const connectToDatabase = async () => {
    if (process.env.NODE_ENV === 'test') return;
    try {
        const mongoURI =
            `mongodb+srv://${process.env.USERNAME_DB}:${process.env.PASSWORD_DB}@cluster0.woy8w.mongodb.net/?retryWrites=true&w=majority` ||
            'mongodb://localhost:27017/template';

        await mongoose.connect(mongoURI);
        logger.info('Connected to the database');
    } catch (error) {
        logger.error('Error connecting to MongoDB:', error.message);
        throw error;
    }
};

export default connectToDatabase;
