import winston from 'winston';

const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
const logLevelConsole = process.env.NODE_ENV === 'test' ? 'error' : logLevel;

const options: winston.LoggerOptions = {
    transports: [
        new winston.transports.File({ filename: 'debug.log', level: logLevel }),
        new winston.transports.Console({
            level: logLevelConsole,
        }),
    ],
};

const logger = winston.createLogger(options);

if (process.env.NODE_ENV === 'test') {
    logger.debug('Logging initialized at test level');
}

if (process.env.NODE_ENV !== 'production') {
    logger.debug('Logging initialized at debug level');
}

export default logger;
