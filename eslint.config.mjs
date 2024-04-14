import js from '@eslint/js'
import ts from 'typescript-eslint'

// https://eslint.org/docs/latest/use/configure/configuration-files
export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    ignores: ['.src/tunnel', '.test/'],
  },
]
