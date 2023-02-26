module.exports = {
  root: true,
  env: {
    es2021: true
  },
  "extends": [
    "plugin:vue/essential",
    "eslint:recommended"
  ],
  rules: {
    "indent": ["off", 2],
    "vue/require-default-prop": "off",
    "no-unused-vars": "warn",
    "no-new": "off",
    "vue/mustache-interpolation-spacing": "off",
    "vue/no-unused-components": "warn",
    "no-multiple-empty-lines": "warn",
    "vue/html-closing-bracket-spacing": "off",
    "space-before-function-paren": "off",
    "object-curly-spacing": "off",
    "vue/singleline-html-element-content-newline": "off",
    "quotes": "off",
    "vue/valid-v-for": "warn",
    "comma-dangle": "warn",
    "no-console": import.meta.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": import.meta.env.NODE_ENV === "production" ? "warn" : "off"
  }
}
