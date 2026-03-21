import js from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import tseslint from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        __REACT_DEVTOOLS_GLOBAL_HOOK__: "readonly",
        chrome: "readonly",
        browser: "readonly",
        gapi: "readonly",
      },
      parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "react": pluginReact,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "react/prop-types": "off",
      "no-prototype-builtins": "off",
      "no-empty": "off",
      "no-cond-assign": "off",
      "no-useless-escape": "off",
      "no-control-regex": "off",
      "valid-typeof": "off",
      "no-fallthrough": "off",
      "no-case-declarations": "off",
      "no-async-promise-executor": "off",
      "no-self-assign": "off",
      "no-func-assign": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-require-imports": "off",
      "no-unreachable": "off",
      "no-misleading-character-class": "off",
      "getter-return": "off",
      "no-constant-condition": "off",
      "no-redeclare": "off"
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
