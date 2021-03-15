module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'airbnb-base'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 11,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'prettier'],
	rules: {
		useTabs: [true, 'Use tabs'],
		'prefer-destructuring': ['warn', { object: true, array: true }],
		'no-unused-vars': ['warn', { argsIgnorePattern: 'req|res|next|val' }],
		...require('eslint-config-prettier').rules,
		...require('eslint-config-prettier/@typescript-eslint').rules,
	},
};
