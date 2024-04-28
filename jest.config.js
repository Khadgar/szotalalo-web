module.exports = {
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  setupFiles: ['dotenv/config'],
  testEnvironment: 'jsdom',
  collectCoverage: true,
  coverageReporters: ['json', 'html'],
};
