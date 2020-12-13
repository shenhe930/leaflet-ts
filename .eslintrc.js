module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020, // So that we can use the latest ECMAScript features such as dynamic imports and nullish coalescing
    sourceType: 'module', // Since we are using ECMAScript modules
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  env: {
    node: true,
  },
  extends: [
    // recommended
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',

    // disabled formatting-related rules for using prettier config
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  rules: {
    // https://eslint.org/docs/rules/complexity
    complexity: ['error', 13],
    // https://eslint.org/docs/rules/max-depth
    'max-depth': ['error', 4],
    // https://github.com/typescript-eslint/typescript-eslint/blob/v4.6.1/packages/eslint-plugin/docs/rules/naming-convention.md
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'variable',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        filter: {
          // allowed env variables like '__ENV__', '__PUBLIC_PATH__'
          regex: '^__[A-Z_]+__$',
          match: false,
        },
      },
      {
        selector: 'function',
        format: ['camelCase', 'PascalCase'],
      },
      {
        selector: 'typeLike', //class, interface, typeAlias, enum, typeParameter
        format: ['PascalCase'],
      },
    ],
    //https://eslint.org/docs/rules/no-else-return
    'no-else-return': ['warn', { allowElseIf: true }],
    // https://eslint.org/docs/rules/no-console
    'no-console': 'warn',
  },
};
