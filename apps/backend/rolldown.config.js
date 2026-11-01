import { defineConfig } from 'rolldown';

export default defineConfig({
  input: 'src/index.ts',
  platform: 'node',
  tsconfig: './tsconfig.json',
  external: ['pg-native'],
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
    cleanDir: true,
  },
});
