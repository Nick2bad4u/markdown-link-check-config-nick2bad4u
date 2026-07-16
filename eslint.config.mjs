import nickTwoBadFourU from "eslint-config-nick2bad4u";

/** @type {import("eslint").Linter.Config[]} */
const config = [
    ...nickTwoBadFourU.configs.all,

    {
        files: ["src/**/*.ts"],
        rules: {
            "@typescript-eslint/promise-function-async": "off",
            "import-x/extensions": "off",
        },
    },
    {
        files: ["test/**/*.ts"],
        rules: {
            "vitest/no-hooks": "off",
            "vitest/prefer-expect-assertions": "off",
            "vitest/require-top-level-describe": "off",
        },
    },
];

export default config;
