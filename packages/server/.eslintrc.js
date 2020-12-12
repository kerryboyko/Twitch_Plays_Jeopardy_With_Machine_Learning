module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "airbnb-base",
    "@vue/typescript/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended",
    "@vue/prettier",
    "@vue/prettier/@typescript-eslint"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module"
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "import/extensions": ["error", "never", { vue: "always", json: "always" }],
    "import/no-unresolved": 0,
    "consistent-return": 0,
    "no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
    "no-restricted-syntax": 0,
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-shadow": 0,
    "@typescript-eslint/no-shadow": 1,
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }]
  },
  overrides: [
    {
      files: ["**/__tests__/*.{j,t}s?(x)", "**/*.spec.{j,t}s?(x)"],
      env: {
        jest: true
      }
    }
  ]
};
