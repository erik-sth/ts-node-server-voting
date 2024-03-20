import logger from '../utils/logger';

const config = () => {
    if (!process.env.USERNAME_DB) {
        logger.error('FATAL ERROR: usernameDB is not defiended');
        process.exit(1);
    }
    if (!process.env.ORIGIN) {
        logger.error('FATAL ERROR: origin is not defiended');
        process.exit(1);
    }
    if (!process.env.PASSWORD_DB) {
        logger.error('FATAL ERROR: password_db is not defiended');
        process.exit(1);
    }
    if (!process.env.JWT) {
        logger.error('FATAL ERROR: jwt is not defiended');
        process.exit(1);
    }
    if (!process.env.COOKIE_SECRET) {
        logger.error('FATAL ERROR: cookie-secret is not defiended');
        process.exit(1);
    }
};

export default config;
