module.exports = {
  preset: "jest-preset-angular",
  moduleNameMapper: {
    c3: "<rootDir>/__mocks__/c3.js"
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupJest.ts"]
}
