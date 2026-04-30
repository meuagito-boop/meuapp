module.exports = {
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": "src",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": {
    "^.+\\.(t|j)s$": ["ts-jest", {
      "tsconfig": "tsconfig.spec.json"
    }]
  },
  "collectCoverageFrom": [
    "**/*.(t|j)s"
  ],
  "coverageDirectory": "../coverage",
  "coveragePathIgnorePatterns": [
    "/node_modules/",
    "/dist/",
    "\\.mock\\.",
    "test/setup"
  ],
  "testEnvironment": "node",
  "roots": [
    "<rootDir>",
    "<rootDir>/../test"
  ],
  "setupFilesAfterEnv": [
    "<rootDir>/../test/setup.ts"
  ],
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/$1",
    "^@modules/(.*)$": "<rootDir>/modules/$1",
    "^@common/(.*)$": "<rootDir>/common/$1",
    "^@config/(.*)$": "<rootDir>/config/$1"
  }
};
