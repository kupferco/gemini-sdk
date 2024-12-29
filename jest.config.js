module.exports = {
    transform: {
        '^.+\\.jsx?$': 'babel-jest', // Use babel-jest to transform JS files
    },
    testEnvironment: 'node', // Set the test environment
    collectCoverage: true, // Enable coverage collection
};
