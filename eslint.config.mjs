import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', '.qa/**', 'tmp/**', 'output/**', 'out/**', 'build/**', 'next-env.d.ts', 'assets-src/**', 'public/**']),
]);

export default eslintConfig;
