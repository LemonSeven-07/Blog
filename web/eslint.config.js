import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import json from '@eslint/json';
import css from '@eslint/css';
import prettier from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: { js, prettier },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.browser },
    rules: {
      // ✅ 相当于 'plugin:prettier/recommended'
      'prettier/prettier': 'error'
    }
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    // 对 JSX/TSX 文件单独配置
    files: ['**/*.{jsx,tsx}'],
    rules: {
      'react/react-in-jsx-scope': 'off' // 关闭旧规则：React 必须在作用域中
    },
    settings: {
      react: {
        version: 'detect' // 自动检测 React 版本，适配 JSX 新特性
      }
    }
  },
  { files: ['**/*.json'], plugins: { json }, language: 'json/json', extends: ['json/recommended'] },
  { files: ['**/*.css'], plugins: { css }, language: 'css/css', extends: ['css/recommended'] }
]);
