# GPR 探地雷达智能解译平台（GitHub Pages 静态版）

TunnelRadar 隧道衬砌检测智能解译系统前端静态站点。

## 目录结构

```
gpr-system/
├ index.html        # 站点主页（含产品介绍 + 六大功能页面）
├ css/style.css     # 全局样式
├ js/detect.js      # 交互逻辑（导航、AI 问答、解译模拟、Tab 切换）
└ assets/           # 静态资源（favicon 等）
```

## 本地预览

直接双击 `index.html` 即可在浏览器打开，或运行：

```bash
python -m http.server 8000
# 访问 http://127.0.0.1:8000
```

## 部署到 GitHub Pages

1. 将本目录内容推送到仓库 `hyq12344543/gpr-system`
2. 仓库 Settings → Pages → Source 选择 `main` 分支根目录
3. 部署完成后访问 `https://hyq12344543.github.io/gpr-system/`

## 功能

- 智能解译：文件导入 + AI 解译流程模拟
- AI 问答：内置 GPR 隧道检测知识库（12 组专业问答）
- 结果分析：成果列表 + 统计分析双视图
- 历史归档：检测数据归档管理
- 联系反馈：反馈表单 + 常见问题
- 社区交流：技术帖子展示

> 说明：GitHub Pages 为纯静态托管，AI 推理与后端 API 需另行部署。
