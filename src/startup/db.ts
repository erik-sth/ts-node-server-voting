import mongoose from 'mongoose';
import logger from '../utils/logger';

const connectToDatabase = async () => {
    if (process.env.NODE_ENV === 'test') return;
    try {
        const mongoURI =
            process.env.MONGODB_URI || 'mongodb://localhost:27017/template';

        await mongoose.connect(mongoURI);
        logger.info('Connected to the database');
    } catch (error) {
        logger.error('Error connecting to MongoDB:', error.message);
        throw error;
    }
};

export default connectToDatabase;
