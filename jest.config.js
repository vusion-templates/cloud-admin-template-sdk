module.exports = {
    roots: ['<rootDir>/dist/'],
    setupFilesAfterEnv: ["<rootDir>/dist/tests/setup.js"],
    coverageReporters: ['html'],
    testPathIgnorePatterns: ['/node_modules/', '/tmp/']
};
