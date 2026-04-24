# GCGLWeb 项目

## 📋 项目简介

**GCGLWeb** 是一个基于 Vue.js 2.x 构建的管理系统前端项目，版本为 3.8.8。该项目采用 Element UI 作为主要 UI 框架，并集成了多种常用组件与工具，适用于企业级后台管理系统开发。

## 🛠️ 技术栈

### 核心框架
- **Vue 2.7.14**
- **Vue Router 3.4.9**
- **Vuex 3.6.0**

### UI 组件库
- **Element UI 2.15.14**
- **VXE Table 3.4.11** (高级表格组件)

### 主要功能组件
| 功能 | 组件 | 版本 |
|------|------|------|
| 图表 | ECharts | 5.4.0 |
| 富文本编辑器 | Quill | 1.3.7 |
| 图片裁剪 | Vue Cropper | 0.5.5 |
| 拖拽排序 | SortableJS | 1.10.2 |
| 大屏可视化 | Visor Vue | 2.4.8 |
| 树形选择 | Vue Treeselect | 0.4.0 |
| 地图可视化 | MapVGL | 1.0.0-beta.191 |
| 全景图查看 | Photo Sphere Viewer | 4.8.1 |

### 工具库
- **HTTP 客户端**: Axios 0.28.1
- **状态持久化**: Vuex Persistedstate
- **日期处理**: Dayjs、Moment.js
- **加密**: JSEncrypt
- **文件保存**: File Saver
- **二维码生成**: QRCodeJS2
- **进度条**: NProgress

## 📦 环境要求

- **Node.js**: >= 8.9 (推荐使用 Volta 管理的 Node 14.21.3)
- **npm**: >= 3.0.0

## 🚀 项目运行

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建命令

| 命令 | 描述 |
|------|------|
| `npm run build:prod` | 生产环境构建 |
| `npm run build:stage` | 预发布环境构建 |
| `npm run build:47` | 47 环境构建 |
| `npm run build:211` | 211 环境构建 |
| `npm run test` | 测试环境构建 |
| `npm run build:all` | 构建所有环境 (47 和 211) |

### 其他命令
```bash
npm run preview  # 预览构建结果
npm run lint     # 代码规范检查
```

## 📝 代码规范

项目使用 ESLint 进行代码规范检查，配置了 Git 提交前自动检查：

- 提交前自动执行 `eslint --fix` 修复可自动修复的问题
- 检查范围：`src/**/*.{js,vue}` 文件

## ✨ 项目特性

1. **多环境支持**: 支持开发、测试、预发布、生产及自定义环境构建
2. **代码质量保证**: 集成 ESLint + Husky + lint-staged 确保代码规范
3. **组件丰富**: 集成了多种业务常用组件
4. **性能优化**: 支持代码分割、压缩等优化
5. **现代化开发**: 使用 Vue CLI 4 构建，支持 Sass 等现代化特性

## 🌐 浏览器兼容性

- 支持所有市场份额大于 1% 的浏览器
- 支持最近两个版本的浏览器

## 📄 许可证

MIT License

## 👨‍💻 作者

cloveryuan (750363796@qq.com)

---

> **提示**: 建议使用 Volta 管理 Node.js 版本，项目已配置为使用 Node 14.21.3。