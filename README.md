# 虎窝导航 (Huwo Nav)

一个基于 Cloudflare Pages 和 Workers 的网址导航站点，支持添加、删除、编辑、导入收藏夹等功能，并拥有带密码保护的编辑模式。

## 功能特性
- 🔐 密码保护的编辑模式
- ➕ 添加新的导航站点
- ✏️ 编辑现有站点信息
- 🗑️ 批量删除站点
- 📥 导入浏览器导出的收藏夹文件 (HTML 格式)
- 📂 分类管理（添加分类）
- 🏷️ 按分类展示站点
- 📱 响应式设计，适配桌面和移动设备
- 🌐 支持环境变量配置网站名称和密码

## 技术栈
- **前端**：React + Vite + Tailwind CSS
- **后端**：Cloudflare Pages Functions
- **存储**：Cloudflare KV
- **部署**：Cloudflare Pages

## 快速开始

### 本地开发
1. 克隆项目
2. 安装依赖：
   ```bash
   npm install
   ```
3. 启动开发服务器：
   ```bash
   npm run dev
   ```
4. 访问 http://localhost:5173

### 部署到 Cloudflare Pages

1. 登录 Cloudflare 控制台
2. 创建一个新的 Pages 项目
3. 连接 GitHub 仓库
4. 配置构建参数：
   - 构建命令：`npm run build`
   - 构建输出目录：`dist`
5. 在 Workers KV 中创建一个名为 `NAV_SITES` 的命名空间，并在 Pages 项目设置中绑定它（变量名：`NAV_SITES`）
6. 在 Pages 项目设置中添加环境变量：
   - `VITE_PASSWORD`：设置你的编辑模式密码
   - `VITE_SITE_NAME`：设置你的自定义网站名称
7. 部署项目

## 项目结构
- `functions/`: Cloudflare Pages Functions (API 后端)
- `src/`: 前端 React 组件
- `wrangler.toml`: Wrangler 配置

## 许可协议
MIT License
