// stylelint.config.js
export default {
  // 指定使用的语法
  extends: [
    'stylelint-config-standard', // css 标准配置
    'stylelint-config-standard-scss', // scss 标准配置
    'stylelint-config-recess-order', // CSS 属性排序配置
    'stylelint-prettier/recommended'
  ],
  plugins: [
    'stylelint-order', // 控制属性顺序
    'stylelint-prettier',
    'stylelint-scss'
  ],
  overrides: [
    {
      files: ['**/*.html', '**/*.vue', '**/*.jsx', '**/*.tsx'],
      customSyntax: 'postcss-html' // 支持 html/vue/jsx 中的 style 标签
    }
  ],
  rules: {
    // 禁止使用未知的 @ 规则
    'at-rule-no-unknown': [
      true,
      {
        // 忽略特定框架或预处理器的规则
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'function',
          'if',
          'else',
          'each',
          'include',
          'mixin',
          'use',
          'forward',
          'return'
        ]
      }
    ],
    'scss/at-rule-no-unknown': true,
    // 禁用空文件警告
    'no-empty-source': null,
    // 检查选择器优先级是否从高到低
    'no-descending-specificity': null,
    // 检查 grid-template-areas 的合法性
    'named-grid-areas-no-invalid': null,
    // 禁止使用未知单位，忽略特定单位，这里 rpx 常用于小程序 / UniApp
    'unit-no-unknown': [true, { ignoreUnits: ['rpx'] }],
    // 永久允许前缀属性
    'property-no-vendor-prefix': null,
    // 控制 样式书写顺序
    // 1、$dollar-variables → SCSS 变量
    // 2、custom-properties → CSS 变量 (--xxx)
    // 3、at-rules → 普通 @import / @include 等
    // 4、declarations → 样式声明
    // 5、@supports → 支持查询
    // 6、@media → 媒体查询
    // 7、rules → 嵌套规则
    'order/order': [
      [
        'dollar-variables',
        'custom-properties',
        'at-rules',
        'declarations',
        { type: 'at-rule', name: 'supports' },
        { type: 'at-rule', name: 'media' },
        'rules'
      ],
      { severity: 'warning' }
    ],

    'rule-empty-line-before': [
      'always',
      {
        except: ['first-nested'],
        ignore: ['after-comment']
      }
    ],

    // 命名规范
    'selector-class-pattern': '^[a-z][a-zA-Z0-9_-]+$', // 小驼峰或 kebab-case
    'selector-max-id': 0,
    'selector-max-type': null,

    // 属性顺序 (大厂常用逻辑顺序)
    'order/properties-order': [
      // 布局属性
      'display',
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'float',
      'clear',
      'z-index',
      // 盒模型
      'box-sizing',
      'width',
      'min-width',
      'max-width',
      'height',
      'min-height',
      'max-height',
      'margin',
      'padding',
      'border',
      'border-radius',
      // 字体/文本
      'font',
      'font-size',
      'font-weight',
      'line-height',
      'letter-spacing',
      'text-align',
      'text-decoration',
      'color',
      // 背景
      'background',
      'background-color',
      'background-image',
      'background-position',
      'background-size',
      'background-repeat',
      // 其他
      'opacity',
      'transition',
      'transform',
      'animation'
    ],

    // SCSS 特有
    'scss/dollar-variable-pattern': '^([a-z][a-zA-Z0-9]+|[a-z]+(-[a-z]+)*)$', // 驼峰或 kebab-case
    'scss/percent-placeholder-pattern': '^([a-z][a-zA-Z0-9]+|[a-z]+(-[a-z]+)*)$'
  },
  ignoreFiles: [
    '**/*.js',
    '**/*.jsx',
    '**/*.tsx',
    '**/*.ts',
    '**/*.json',
    '**/*.md',
    '**/*.yaml',
    'dist/**',
    'node_modules/**',
    'src/assets/iconfont/'
  ]
};
