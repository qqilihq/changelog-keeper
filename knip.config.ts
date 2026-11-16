import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // `exports` and `bin` point into dist/, which only exists after a build
  entry: ['lib/index.ts', 'test/**/*.test.ts'],
  project: ['lib/**/*.ts', 'test/**/*.ts', '*.ts'],
};

export default config;
