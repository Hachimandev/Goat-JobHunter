import type { Config } from "jest";

const config: Config = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/.expo/"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
};

export default config;
