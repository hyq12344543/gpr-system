<template>
  <div class="page-history">
    <div class="page-header">
      <h1 class="page-title">历史归档</h1>
      <p class="page-desc">查看和管理历史解译项目记录</p>
    </div>
    <div class="search-bar">
      <div class="search-input-wrap">
        <svg class="search-icon" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="9" r="5"/><path d="M13 13l4 4"/></svg>
        <input v-model="searchQuery" type="text" class="search-input" placeholder="搜索项目名称、地点、备注...">
      </div>
      <div class="filter-chips">
        <button v-for="chip in filterChips" :key="chip.key" class="chip" :class="{ active: activeFilter === chip.key }" @click="activeFilter = chip.key">
          {{ chip.label }}<span class="chip-count">{{ chip.count }}</span>
        </button>
      </div>
      <div class="sort-group">
        <span class="sort-label">排序：</span>
        <select v-model="sortBy" class="sort-select">
          <option value="date-desc">最新优先</option>
          <option value="date-asc">最早优先</option>
          <option value="name">按名称</option>
          <option value="targets">按目标数</option>
        </select>
      </div>
    </div>
    <div class="archive-grid">
      <div v-for="(proj, i) in filteredProjects" :key="i" class="archive-card" :class="{ expanded: expanded === i }" @click="toggleExpand(i)">
        <div class="card-preview">
          <canvas :ref="el => { if (el) renderMiniRadargram(el, i) }" class="mini-canvas"></canvas>
          <div class="card-status" :class="proj.status">{{ proj.status === "verified" ? "已核验" : "待审" }}</div>
        </div>
        <div class="card-body">
          <div class="card-title">{{ proj.name }}</div>
          <div class="card-date">
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="8" cy="8" r="6"/><path d="M8 4v4l3 2"/></svg>
            {{ proj.date }}
          </div>
          <div class="card-meta">
            <div class="meta-item"><span class="meta-value">{{ proj.traces }}</span><span class="meta-label">道数</span></div>
            <div class="meta-divider"></div>
            <div class="meta-item"><span class="meta-value">{{ proj.targets }}</span><span class="meta-label">目标</span></div>
            <div class="meta-divider"></div>
            <div class="meta-item"><span class="meta-value">{{ proj.depth }}</span><span class="meta-label">深度(m)</span></div>
          </div>
          <div v-if="expanded === i" class="card-detail">
            <div class="detail-row"><span>处理算法</span><span>{{ proj.algorithm }}</span></div>
            <div class="detail-row"><span>平均置信度</span><span>{{ (proj.confidence * 100).toFixed(0) }}%</span></div>
            <div class="detail-row"><span>数据格式</span><span>{{ proj.format }}</span></div>
            <div class="detail-row"><span>备注</span><span>{{ proj.note }}</span></div>
            <div class="detail-actions">
              <button class="detail-btn" @click.stop="openProject(proj)">
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M2 4h12M2 8h12M2 12h8"/></svg>
                查看详情
              </button>
              <button class="detail-btn secondary" @click.stop="exportProject(proj)">
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M8 2v8M5 7l3 3 3-3"/><path d="M2 12v1a2 2 0 002 2h8a2 2 0 002-2v-1"/></svg>
                导出报告
              </button>
              <button class="detail-btn danger" @click.stop="deleteProject(i)">
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M4 4v9a2 2 0 002 2h4a2 2 0 002-2V4"/></svg>
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!filteredProjects.length" class="empty-state">
      <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="24" cy="24" r="18"/><path d="M24 16v8l6 4"/></svg>
      <p>没有匹配的项目</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
const searchQuery = ref("")
const activeFilter = ref("all")
const sortBy = ref("date-desc")
const expanded = ref(-1)
const allProjects = ref([
  { name: "site_a_line01", date: "2026-07-21", traces: 256, targets: 12, depth: 15.6, confidence: 0.87, algorithm: "GPR-YOLO", format: "SEG-Y", status: "verified", note: "市政道路检测" },
  { name: "site_b_survey", date: "2026-07-20", traces: 320, targets: 8, depth: 18.2, confidence: 0.82, algorithm: "GPR-UNet", format: "DZT", status: "pending", note: "桥梁结构检测" },
  { name: "site_c_raw", date: "2026-07-19", traces: 400, targets: 15, depth: 12.8, confidence: 0.84, algorithm: "GPR-YOLO", format: "RD3", status: "verified", note: "地下管线普查" },
  { name: "site_d_road", date: "2026-07-18", traces: 180, targets: 5, depth: 8.5, confidence: 0.79, algorithm: "GPR-CNN", format: "SEG-2", status: "verified", note: "路面厚度检测" },
  { name: "site_e_tunnel", date: "2026-07-17", traces: 500, targets: 20, depth: 25.0, confidence: 0.91, algorithm: "GPR-Transformer", format: "SEG-Y", status: "pending", note: "隧道衬砌检测" },
  { name: "site_f_bridge", date: "2026-07-15", traces: 220, targets: 10, depth: 11.3, confidence: 0.86, algorithm: "GPR-YOLO", format: "DZT", status: "verified", note: "桥梁支座检测" },
  { name: "site_g_pipe", date: "2026-07-12", traces: 150, targets: 7, depth: 6.8, confidence: 0.81, algorithm: "GPR-UNet", format: "CSV", status: "pending", note: "排水管道检测" },
  { name: "site_h_foundation", date: "2026-07-10", traces: 350, targets: 18, depth: 20.5, confidence: 0.89, algorithm: "GPR-YOLO", format: "SEG-Y", status: "verified", note: "地基基础检测" },
])
const filterChips = computed(() => [
  { key: "all", label: "全部", count: allProjects.value.length },
  { key: "verified", label: "已核验", count: allProjects.value.filter(p => p.status === "verified").length },
  { key: "pending", label: "待审", count: allProjects.value.filter(p => p.status === "pending").length },
])
const filteredProjects = computed(() => {
  let list = [...allProjects.value]
  if (activeFilter.value !== "all") list = list.filter(p => p.status === activeFilter.value)
  if (searchQuery.value.trim()) { const q = searchQuery.value.toLowerCase(); list = list.filter(p => p.name.toLowerCase().includes(q) || p.note.toLowerCase().includes(q)) }
  if (sortBy.value === "date-desc") list.sort((a, b) => b.date.localeCompare(a.date))
  else if (sortBy.value === "date-asc") list.sort((a, b) => a.date.localeCompare(b.date))
  else if (sortBy.value === "name") list.sort((a, b) => a.name.localeCompare(b.name))
  else if (sortBy.value === "targets") list.sort((a, b) => b.targets - a.targets)
  return list
})
function toggleExpand(i) { expanded.value = expanded.value === i ? -1 : i }
function openProject(p) { }
function exportProject(p) { }
function deleteProject(i) { allProjects.value.splice(i, 1) }
function renderMiniRadargram(canvas, seed) {
  const w = canvas.parentElement.clientWidth; const h = 100
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext("2d")
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const v = Math.sin((x / w * 30 + y / h * 20 + seed * 2) * Math.PI) * 0.5
        + Math.sin((x / w * 8 + y / h * 5) * Math.PI * 2) * 0.2
        + (Math.random() - 0.5) * 0.06
      const val = Math.floor(((Math.max(-1, Math.min(1, v)) + 1) / 2) * 255)
      if (val > 200) { ctx.fillStyle = "rgba(59,130,246," + ((val - 200) / 55 * 0.4) + ")" }
      else { ctx.fillStyle = "rgb(" + (val * 0.15) + "," + (val * 0.15) + "," + (val * 0.2) + ")" }
      ctx.fillRect(x, y, 1, 1)
    }
  }
}
</script>

<style scoped>
.page-history { display: flex; flex-direction: column; gap: 20px; }
.page-header { padding: 8px 0; }
.page-title { font-size: 22px; font-weight: 600; color: #1e293b; letter-spacing: 0.5px; }
.page-desc { font-size: 13px; color: #64748b; margin-top: 4px; }
.search-bar { display: flex; align-items: center; gap: 16px; background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; flex-wrap: wrap; }
.search-input-wrap { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 200px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0 10px; }
.search-input-wrap:focus-within { border-color: #3b82f6; }
.search-icon { color: #475569; flex-shrink: 0; }
.search-input { flex: 1; padding: 8px 0; background: none; border: none; color: #1e293b; font-size: 13px; outline: none; }
.search-input::placeholder { color: #cbd5e1; }
.filter-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.chip { display: flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 14px; background: transparent; border: 1px solid #cbd5e1; color: #64748b; font-size: 12px; cursor: pointer; transition: all 0.15s; }
.chip:hover { border-color: #3b82f6; color: #475569; }
.chip.active { background: rgba(59,130,246,0.1); border-color: #3b82f6; color: #3b82f6; }
.chip-count { font-size: 10px; opacity: 0.6; }
.sort-group { display: flex; align-items: center; gap: 6px; margin-left: auto; }
.sort-label { font-size: 12px; color: #475569; }
.sort-select { padding: 4px 8px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; color: #475569; font-size: 12px; outline: none; cursor: pointer; }
.sort-select:focus { border-color: #3b82f6; }
.archive-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
.archive-card { background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; cursor: pointer; transition: all 0.2s; }
.archive-card:hover { border-color: #cbd5e1; }
.archive-card.expanded { border-color: rgba(59,130,246,0.2); }
.card-preview { position: relative; height: 100px; overflow: hidden; background: #f8fafc; }
.mini-canvas { width: 100%; height: 100%; display: block; }
.card-status { position: absolute; top: 8px; right: 8px; padding: 2px 10px; border-radius: 10px; font-size: 10px; font-weight: 500; }
.card-status.verified { background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
.card-status.pending { background: rgba(245,158,11,0.15); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2); }
.card-body { padding: 14px 16px; }
.card-title { font-size: 14px; font-weight: 500; color: #1e293b; margin-bottom: 4px; }
.card-date { font-size: 11px; color: #475569; display: flex; align-items: center; gap: 4px; margin-bottom: 12px; }
.card-meta { display: flex; align-items: center; gap: 16px; }
.meta-item { display: flex; flex-direction: column; align-items: center; }
.meta-value { font-size: 15px; font-weight: 600; color: #334155; font-family: "SF Mono", monospace; }
.meta-label { font-size: 10px; color: #475569; margin-top: 1px; }
.meta-divider { width: 1px; height: 28px; background: #e2e8f0; }
.card-detail { margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; }
.detail-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; }
.detail-row span:first-child { color: #64748b; }
.detail-row span:last-child { color: #475569; }
.detail-actions { display: flex; gap: 8px; margin-top: 12px; }
.detail-btn { display: flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 4px; font-size: 11px; background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.15); color: #3b82f6; cursor: pointer; transition: all 0.1s; }
.detail-btn:hover { background: rgba(59,130,246,0.15); }
.detail-btn.secondary { background: transparent; border: 1px solid #cbd5e1; color: #64748b; }
.detail-btn.secondary:hover { border-color: #64748b; color: #475569; }
.detail-btn.danger { background: transparent; border: 1px solid rgba(239,68,68,0.15); color: #ef4444; }
.detail-btn.danger:hover { background: rgba(239,68,68,0.08); }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 60px; color: #cbd5e1; }
.empty-state p { font-size: 14px; color: #475569; }
</style>