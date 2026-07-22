<template>
  <div class="app-container">
    <nav class="top-nav">
      <div class="nav-inner">
        <div class="nav-brand">
          <svg class="brand-icon" viewBox="0 0 32 32" width="28" height="28">
            <circle cx="16" cy="16" r="14" fill="none" stroke="#3b82f6" stroke-width="1.5"/>
            <path d="M4 16 Q10 8 16 16 Q22 24 28 16" fill="none" stroke="#14b8a6" stroke-width="2"/>
            <circle cx="16" cy="16" r="3" fill="#3b82f6" opacity="0.4"/>
          </svg>
          <span class="brand-text">GPR解译系统</span>
        </div>
        <div class="nav-links">
          <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="nav-item" :class="{ active: isActive(item.path) }">
            <span class="nav-icon" v-html="item.icon"></span>
            <span class="nav-label">{{ item.label }}</span>
          </router-link>
        </div>
      </div>
    </nav>
    <main class="main-area">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router"
const route = useRoute()
const navItems = [
  { path: "/", label: "智能解译", icon: "<svg viewBox=\"0 0 20 20\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><circle cx=\"10\" cy=\"10\" r=\"7\"/><path d=\"M10 7v3l2 2\"/><path d=\"M5 5l2-2M15 5l-2-2M10 17v2\"/></svg>" },
  { path: "/ai-chat", label: "AI问答", icon: "<svg viewBox=\"0 0 20 20\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M3 10a7 7 0 0114 0v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4z\"/><path d=\"M8 14l-3 3\"/><path d=\"M10 8v3M8 9h4\"/></svg>" },
  { path: "/results", label: "结果展示", icon: "<svg viewBox=\"0 0 20 20\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M3 16L7 8l3 4 4-8 3 6\"/><path d=\"M2 18h16\"/></svg>" },
  { path: "/statistics", label: "统计分析", icon: "<svg viewBox=\"0 0 20 20\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M3 18V6M8 18V3M13 18v-9M18 18v-5\"/></svg>" },
  { path: "/history", label: "历史归档", icon: "<svg viewBox=\"0 0 20 20\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><circle cx=\"10\" cy=\"10\" r=\"7\"/><path d=\"M10 6v4l3 2\"/></svg>" },
  { path: "/contact", label: "联系反馈", icon: "<svg viewBox=\"0 0 20 20\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M2 4l8 6 8-6M4 4h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z\"/></svg>" },
]
function isActive(path) {
  if (path === "/") return route.path === "/"
  return route.path.startsWith(path)
}
</script>

<style scoped>
.app-container { min-height: 100vh; display: flex; flex-direction: column; background: #f0f4f8; }
.top-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(203, 213, 225, 0.5);
}
.nav-inner { max-width: 1400px; margin: 0 auto; display: flex; align-items: center; height: 56px; padding: 0 24px; }
.nav-brand { display: flex; align-items: center; gap: 10px; margin-right: 32px; flex-shrink: 0; }
.brand-text { font-size: 15px; font-weight: 600; color: #1e293b; letter-spacing: 0.5px; white-space: nowrap; }
.nav-links { display: flex; align-items: center; gap: 1px; flex: 1; }
.nav-item { display: flex; align-items: center; gap: 5px; padding: 7px 14px; border-radius: 6px; color: #64748b; text-decoration: none; font-size: 12.5px; font-weight: 500; transition: all 0.15s ease; white-space: nowrap; }
.nav-item:hover { color: #1e293b; background: rgba(59, 130, 246, 0.06); }
.nav-item.active, .nav-item.router-link-exact-active { color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
.nav-icon { display: flex; align-items: center; opacity: 0.7; }
.nav-item.active .nav-icon { opacity: 1; }
.main-area { margin-top: 56px; flex: 1; padding: 24px; max-width: 1400px; width: 100%; margin-left: auto; margin-right: auto; box-sizing: border-box; }
</style>