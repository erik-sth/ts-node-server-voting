import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js'],
    testMatch: ['**/test/**/*.test.(ts|js)'],
    transform: {
        '^.+\\.(ts)$': 'ts-jest',
    },
};

export default config;
