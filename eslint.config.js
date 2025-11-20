import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import sveltePlugin from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';

export default [
	// Ignore patterns
	{
		ignores: ['dist', '.svelte-kit', 'build', 'coverage']
	},
	// JavaScript/TypeScript files
	{
		files: ['**/*.{js,ts}'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: {
				...globals.browser,
				...globals.node,
				...globals.es2020
			}
		},
		...js.configs.recommended
	},
	// TypeScript files
	...tseslint.configs.recommended.map((config) => ({
		...config,
		files: ['**/*.{ts,tsx}']
	})),
	// Svelte files
	...sveltePlugin.configs['flat/recommended'],
	{
		files: ['**/*.svelte'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: {
				...globals.browser
			},
			parser: svelteParser,
			parserOptions: {
				parser: tseslint.parser,
				extraFileExtensions: ['.svelte']
			}
		}
	},
	// Test files
	{
		files: ['**/*.test.{js,ts}'],
		languageOptions: {
			globals: {
				...globals.node
			}
		}
	}
];
