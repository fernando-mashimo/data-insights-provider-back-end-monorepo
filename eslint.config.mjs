import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import ts from 'typescript-eslint';

export default ts.config(js.configs.recommended, ...ts.configs.recommended, prettier, {
	ignores: ['build/', 'cdk.out']
});
