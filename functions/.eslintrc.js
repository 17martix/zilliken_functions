module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "google",
    ],
    rules: {
        "indent": "off",
        "quotes": ["error", "double"],
        "eol-last": ["error", "never"],
        "max-len": ["error", {"code": 120}],
    },
};