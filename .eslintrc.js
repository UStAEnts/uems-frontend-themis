module.exports = {
    env: {
        browser: true,
        es2020: true,
        node: true,
        jest: true,
    },
    extends: [
        'plugin:react/recommended',
        'airbnb',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 11,
        sourceType: 'module',
    },
    plugins: [
        'react',
        '@typescript-eslint',
    ],
    rules: {
        indent: ['error', 4],
        'max-len': ['error', 120],
        'padded-blocks': 'off',

        'no-unused-vars': 'off',
        'no-restricted-syntax': 'off',
        'no-use-before-define': 'off',
        'no-plusplus': ['error', {
            allowForLoopAfterthoughts: true,
        }],

        'react/destructuring-assignment': 0,
        'react/jsx-indent-props': ['error', 4],
        'react/jsx-indent': ['error', 4],
        'react/static-property-placement': ['error', 'static public field'],
        'react/jsx-filename-extension': ['error', {
            extensions: ['.jsx', '.tsx'],
        }],

        'import/extensions': 0,
        'import/no-unresolved': 0,
        'import/prefer-default-export': 0,

        '@typescript-eslint/no-unused-vars': 'error',

        'jsx-a11y/anchor-is-valid': 'off',
        'jsx-a11y/no-noninteractive-element-interactions': 'off',
        'jsx-a11y/label-has-associated-control': ['error', {
            assert: 'htmlFor',
        }],
    },
    settings: {
        'import/resolver': {
            node: {
                paths: ['src'],
            },
        },
    },
};
