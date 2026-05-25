import type { Config } from "jest";

const tsJestOptions = {
  tsconfig: "tsconfig.jest.json",
};

const config: Config = {
  projects: [
    {
      displayName: "unit",
      testMatch: ["<rootDir>/__tests__/unit/**/*.test.ts"],
      transform: { "^.+\\.tsx?$": ["ts-jest", tsJestOptions] },
      moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
    },
    {
      displayName: "components",
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/__tests__/components/**/*.test.tsx"],
      transform: { "^.+\\.tsx?$": ["ts-jest", tsJestOptions] },
      moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
    },
  ],
};

export default config;
