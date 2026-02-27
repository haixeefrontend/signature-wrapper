# Element Plus 味动态表单

`signature-wrapper` 是一个基于 [signature_pad](https://github.com/szimek/signature_pad) 的签名组件。

## 引用方式

此项目可以通过多种方式引用：

### 直接引用

编译或下载打包后的文件，提取 `dist/signature-wrapper.umd.js`，并在 HTML 文件中通过 `<script>` 标签引入：

```html
<script src="path/to/signature-wrapper.umd.js"></script>
```

### 通过 yarn / npm 安装

下载打包的 `.tgz` 包，然后通过以下命令安装：

```bash
yarn add path/to/signature-wrapper-x.y.z.tgz
# 或者使用 npm
npm install path/to/signature-wrapper-x.y.z.tgz
```

### 源码编译并安装到 yarn / npm 项目中

克隆本项目到需安装的项目目录下（如 `external/signature-wrapper`）

```bash
git clone https://github.com/haixeefrontend/signature-wrapper.git external/signature-wrapper
```

然后运行以下命令：

```bash
yarn add signature-wrapper@file:./external/signature-wrapper
# 或者使用 npm
npm install signature-wrapper@file:./external/signature-wrapper
```

## 用法

```vue
<script setup lang="ts">
import type { BaseField } from 'signature-wrapper'

const fields = ref<BaseField[]>([])
</script>

<template>
  <edf-designer v-model="fields" />
</template>
```

### 组件属性

#### `v-model / modelValue`

- 类型: `BaseField[]`
- 默认值: `[]`
- 描述: 用于绑定和管理表单字段的数组。未定义时组件无法正常运行。

#### `show-buttons`

- 类型: `boolean | 'hover'`
- 默认值: `true`
- 描述: 控制操作按钮的显示方式。`true` 表示始终显示，`false` 表示隐藏，`'hover'` 表示仅在鼠标悬停时显示。
