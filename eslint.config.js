// @ts-check

/** @type {import("./.nuxt/eslint.config.d.mts").withNuxt} */
import withNuxt from "./.nuxt/eslint.config.mjs"

const commonRules = {
  "@stylistic/quotes": [
    "error",
    "double",
  ],
  "@stylistic/semi": [
    "error",
    "never",
  ],
  "@stylistic/comma-dangle": [
    "error",
    "always-multiline",
  ],
  "@stylistic/object-curly-spacing": ["error", "always"],
  "@stylistic/block-spacing": ["error", "always"],
  "@stylistic/space-before-function-paren": ["error", {
    named: "never",
  }],
  "@stylistic/brace-style": ["error", "1tbs"],
  "no-useless-constructor": "off",
  "vue/multi-word-component-names": "off",
  "vue/no-v-html": "off",
  "vue/valid-v-slot": ["error", {
    allowModifiers: true,
  }],
  "import/named": "off",
  "no-use-before-define": "off",
  "@typescript-eslint/ban-ts-comment": "off",
  "no-void": [
    "error",
    {
      allowAsStatement: true,
    },
  ],
  "@typescript-eslint/no-floating-promises": [
    "error",
    {
      ignoreIIFE: true,
    },
  ],
  "@typescript-eslint/no-misused-promises": [
    "error",
    {
      checksVoidReturn: {
        arguments: false,
      },
    },
  ],
  "@typescript-eslint/no-unsafe-member-access": "off",
  "@typescript-eslint/no-explicit-any": "off",
  "@typescript-eslint/no-namespace": "off",
  "@typescript-eslint/unified-signatures": "off", // for emits in vue components
}

export default withNuxt().overrideRules(commonRules)
