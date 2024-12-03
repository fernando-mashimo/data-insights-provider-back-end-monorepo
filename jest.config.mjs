export default {
	testEnvironment: 'node',
	roots: ['<rootDir>'],
	testMatch: ['**/?(*.)+(test).ts'],
	transform: {
		'^.+\\.tsx?$': 'ts-jest'
	},
  moduleNameMapper: {
    '^\\$config$': '<rootDir>/src/config.ts',
  }
};
