const js = require("@eslint/js");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "eslint.config.js"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended
);