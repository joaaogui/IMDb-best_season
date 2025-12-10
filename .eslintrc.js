module.exports = {
  root: true,
  env: {
    es2021: true
  },
  "extends": [
    "eslint:recommended"
  ],
  rules: {
    "indent": ["off", 2],
    "no-unused-vars": "warn",
    "no-new": "off",
    "no-multiple-empty-lines": "warn",
    "space-before-function-paren": "off",
    "object-curly-spacing": "off",
    "quotes": "off",
    "comma-dangle": "warn",
    "no-console": import.meta.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": import.meta.env.NODE_ENV === "production" ? "warn" : "off"
  }
}
