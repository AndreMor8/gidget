module.exports = {
    env: {
        node: true,
        es6: true
    },
    globals: {
        Command: "writable",
        gc: "readonly",
        SlashCommand: "readonly",
        fetch: "readonly"
    },
    extends: ["eslint:recommended", "plugin:import/recommended"],
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module"
    },
    rules: {
        semi: ["off", "always"],
        quotes: ["off", "double"],
        'no-unused-vars': ["warn"],
        'no-void': ["error"],
        'comma-spacing': ["warn"],
        'no-extra-semi': ["error"],
        'require-await': ["warn"],
        'no-const-assign': ["error"],
        'no-var': ["error"],
        'prefer-const': ["error"],
        'import/no-deprecated': ["warn"]
    }
}
