export default {
    transform: {
        '^.+\\.[tj]sx?$': 'babel-jest', // Transpile TypeScript and JavaScript
    },
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts', '.tsx'], // Treat these as ES modules
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Jest setup file
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1', // Map imports without .js extensions
    },
};
