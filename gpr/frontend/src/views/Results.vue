<template>
  <div class="page-results">
    <div class="page-header">
      <h1 class="page-title">结果展示</h1>
      <p class="page-desc">探地雷达剖面展示与解译结果可视化</p>
    </div>
    <div class="results-grid">
      <div class="results-sidebar">
        <div class="panel">
          <div class="panel-header"><h3>数据列表</h3></div>
          <div class="result-list">
            <div v-for="(item, i) in resultItems" :key="i" class="result-item" :class="{ active: i === activeResult }" @click="activeResult = i">
              <div class="result-icon">
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M2 6h12M6 2v12"/></svg>
              </div>
              <div class="result-meta">
                <span class="result-name">{{ item.name }}</span>
                <span class="result-info">{{ item.date }} / {{ item.targets }} 目标</span>
              </div>
              <span class="result-status" :class="item.status"></span>
            </div>
          </div>
        </div>
        <div class="panel">
          <div class="panel-header"><h3>显示控制</h3></div>
          <div class="display-controls">
            <div class="ctrl-group">
              <label class="ctrl-label">增益</label>
              <input type="range" v-model.number="display.gain" min="0" max="100" class="range-input">
            </div>
            <div class="ctrl-group">
              <label class="ctrl-label">对比度</label>
              <input type="range" v-model.number="display.contrast" min="0" max="100" class="range-input">
            </div>
            <div class="ctrl-group">
              <label class="ctrl-label">色标</label>
              <select v-model="display.colormap" class="param-select">
                <option value="gray">灰度</option>
                <option value="seismic">地震</option>
                <option value="hot">热力</option>
                <option value="viridis">Viridis</option>
              </select>
            </div>
            <div class="ctrl-check">
              <label class="check-label">
                <input type="checkbox" v-model="display.showAnomalies" class="check-input">
                <span class="check-box"></span>
                显示异常标记
              </label>
            </div>
            <div class="ctrl-check">
              <label class="check-label">
                <input type="checkbox" v-model="display.showLayers" class="check-input">
                <span class="check-box"></span>
                显示层位线
              </label>
            </div>
            <div class="ctrl-check">
              <label class="check-label">
                <input type="checkbox" v-model="display.showGrid" class="check-input">
                <span class="check-box"></span>
                显示网格线
              </label>
            </div>
          </div>
        </div>
        <div class="panel">
          <div class="panel-header"><h3>工具</h3></div>
          <div class="tool-grid">
            <button class="tool-btn" :class="{ active: tool === 'select' }" @click="tool = 'select'" title="选择">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4 3l2 14 4-4 4 4 2-2-4-4 4-4-14-2z"/></svg>
            </button>
            <button class="tool-btn" :class="{ active: tool === 'pan' }" @click="tool = 'pan'" title="平移">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M10 3v14M3 10h14"/></svg>
            </button>
            <button class="tool-btn" :class="{ active: tool === 'zoom' }" @click="tool = 'zoom'" title="缩放">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="9" cy="9" r="5"/><path d="M13 13l4 4M6 9h6M9 6v6"/></svg>
            </button>
            <button class="tool-btn" @click="exportResult" title="导出">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M10 3v10M6 9l4 4 4-4"/><path d="M3 15v2a2 2 0 002 2h10a2 2 0 002-2v-2"/></svg>
            </button>
          </div>
        </div>
      </div>
      <div class="results-main">
        <div class="radargram-container">
          <canvas ref="radarCanvas" class="radargram-canvas"></canvas>
          <div class="radargram-overlay">
            <div class="overlay-info">
              <span>道数: {{ activeData.traces }}</span>
              <span>采样点: {{ activeData.samples }}</span>
              <span>时窗: {{ activeData.timeWindow }} ns</span>
              <span>深度: {{ activeData.depth }} m</span>
            </div>
          </div>
          <div class="legend-bar">
            <span class="legend-label">-</span>
            <div class="legend-gradient"></div>
            <span class="legend-label">+</span>
          </div>
        </div>
        <div class="interpretation-panel">
          <div class="panel-header">
            <h3>解译结果</h3>
            <div class="panel-actions">
              <span class="target-count">{{ activeData.targets }} 个目标</span>
            </div>
          </div>
          <div class="target-table">
            <div class="target-head">
              <span>编号</span><span>位置 (道)</span><span>深度 (m)</span><span>类型</span><span>置信度</span>
            </div>
            <div v-for="(t, i) in activeData.targetList" :key="i" class="target-row" :class="{ highlighted: i === highlightedTarget }" @mouseenter="highlightedTarget = i" @mouseleave="highlightedTarget = -1">
              <span>{{ String(i+1).padStart(2, "0") }}</span>
              <span>{{ t.trace }}</span>
              <span>{{ t.depth.toFixed(2) }}</span>
              <span><span class="tag" :style="{ borderColor: targetColor(t.type) }">{{ t.type }}</span></span>
              <span class="conf-cell">{{ (t.confidence * 100).toFixed(0) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue"
const activeResult = ref(0)
const highlightedTarget = ref(-1)
const tool = ref("select")
const radarCanvas = ref(null)
const activeData = computed(() => resultItems.value[activeResult.value] || resultItems.value[0])
const resultItems = ref([
  { name: "site_a_line01", date: "2026-07-21", targets: 12, status: "verified", traces: 256, samples: 512, timeWindow: 200, depth: 15.6,
    targetList: [
      { trace: 34, depth: 2.15, type: "管道", confidence: 0.92 },
      { trace: 78, depth: 5.34, type: "空洞", confidence: 0.87 },
      { trace: 112, depth: 3.67, type: "管道", confidence: 0.84 },
      { trace: 145, depth: 7.89, type: "异常体", confidence: 0.76 },
      { trace: 178, depth: 1.23, type: "钢筋", confidence: 0.95 },
      { trace: 203, depth: 9.45, type: "空洞", confidence: 0.81 },
    ]},
  { name: "site_b_survey", date: "2026-07-20", targets: 8, status: "pending", traces: 320, samples: 600, timeWindow: 250, depth: 18.2,
    targetList: [
      { trace: 45, depth: 3.12, type: "管道", confidence: 0.88 },
      { trace: 89, depth: 6.78, type: "空洞", confidence: 0.79 },
      { trace: 156, depth: 4.56, type: "异常体", confidence: 0.73 },
      { trace: 234, depth: 10.21, type: "空洞", confidence: 0.85 },
    ]},
  { name: "site_c_raw", date: "2026-07-19", targets: 15, status: "verified", traces: 400, samples: 400, timeWindow: 180, depth: 12.8,
    targetList: [
      { trace: 23, depth: 1.45, type: "钢筋", confidence: 0.96 },
      { trace: 67, depth: 4.23, type: "管道", confidence: 0.91 },
      { trace: 134, depth: 5.67, type: "空洞", confidence: 0.83 },
      { trace: 189, depth: 8.12, type: "异常体", confidence: 0.77 },
      { trace: 256, depth: 2.89, type: "管道", confidence: 0.88 },
      { trace: 312, depth: 7.34, type: "空洞", confidence: 0.82 },
    ]},
])
const display = reactive({ gain: 50, contrast: 50, colormap: "gray", showAnomalies: true, showLayers: true, showGrid: true })
function targetColor(type) { const map = { "管道": "#10b981", "空洞": "#f59e0b", "异常体": "#ef4444", "钢筋": "#3b82f6" }; return map[type] || "#64748b" }
function exportResult() {}
onMounted(() => {
  if (radarCanvas.value) {
    const ctx = radarCanvas.value.getContext("2d")
    const w = radarCanvas.value.parentElement.clientWidth - 40
    const h = 400
    radarCanvas.value.width = w; radarCanvas.value.height = h
    ctx.fillStyle = "#f8fafc"; ctx.fillRect(0, 0, w, h)
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        const nx = x / w; const ny = y / h
        let v = Math.sin((nx * 40 + ny * 30) * Math.PI) * 0.5
        v += Math.sin((nx * 12 + ny * 8) * Math.PI * 2) * 0.3
        v += Math.sin((nx * 3 + ny * 5 + 0.5) * Math.PI * 4) * 0.15
        v += (Math.random() - 0.5) * 0.08
        v = Math.max(-1, Math.min(1, v))
        const val = Math.floor(((v + 1) / 2) * 255)
        ctx.fillStyle = "rgb(" + val + "," + val + "," + val + ")"
        ctx.fillRect(x, y, 1, 1)
      }
    }
    if (display.showGrid) {
      ctx.strokeStyle = "rgba(59, 130, 246, 0.08)"; ctx.lineWidth = 0.5
      for (let x = 0; x < w; x += w / 16) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
      for (let y = 0; y < h; y += h / 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }
    }
    if (display.showAnomalies) {
      const active = activeData.value
      if (active && active.targetList) {
        active.targetList.forEach((t, i) => {
          const traceRatio = t.trace / active.traces; const depthRatio = t.depth / active.depth
          const cx = 20 + traceRatio * (w - 40); const cy = depthRatio * h
          const colors = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6"]
          const ci = { "管道": 0, "空洞": 1, "异常体": 2, "钢筋": 3 }[t.type] || 0
          ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2)
          ctx.fillStyle = colors[ci].replace(")", ",0.15)").replace("rgb", "rgba"); ctx.fill()
          ctx.strokeStyle = colors[ci]; ctx.lineWidth = 1.5; ctx.stroke()
          if (i === highlightedTarget.value) {
            ctx.fillStyle = colors[ci]; ctx.font = "11px sans-serif"; ctx.fillText(t.type, cx + 10, cy + 4)
          }
        })
      }
    }
  }
})
</script>

<style scoped>
.page-results { display: flex; flex-direction: column; gap: 24px; }
.page-header { padding: 8px 0; }
.page-title { font-size: 22px; font-weight: 600; color: #1e293b; letter-spacing: 0.5px; }
.page-desc { font-size: 13px; color: #64748b; margin-top: 4px; }
.results-grid { display: grid; grid-template-columns: 260px 1fr; gap: 20px; align-items: start; }
.panel { background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 16px; }
.panel-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(241, 245, 249, 0.8); border-bottom: 1px solid #e2e8f0; }
.panel-header h3 { font-size: 12.5px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.8px; }
.panel-actions { display: flex; align-items: center; gap: 8px; }
.result-list { padding: 8px; }
.result-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 4px; cursor: pointer; transition: all 0.1s; }
.result-item:hover { background: rgba(59,130,246,0.06); }
.result-item.active { background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.15); }
.result-icon { color: #475569; flex-shrink: 0; }
.result-item.active .result-icon { color: #3b82f6; }
.result-meta { flex: 1; display: flex; flex-direction: column; }
.result-name { font-size: 12.5px; color: #475569; }
.result-info { font-size: 11px; color: #475569; margin-top: 1px; }
.result-status { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.result-status.verified { background: #10b981; }
.result-status.pending { background: #f59e0b; }
.display-controls { padding: 12px 16px; }
.ctrl-group { margin-bottom: 12px; }
.ctrl-label { display: block; font-size: 12px; color: #64748b; margin-bottom: 6px; }
.range-input { width: 100%; height: 4px; -webkit-appearance: none; appearance: none; background: #cbd5e1; border-radius: 2px; outline: none; }
.range-input::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #3b82f6; cursor: pointer; border: 2px solid #ffffff; }
.param-select { width: 100%; padding: 6px 10px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; color: #334155; font-size: 12.5px; outline: none; cursor: pointer; }
.param-select:focus { border-color: #3b82f6; }
.ctrl-check { margin-bottom: 8px; }
.check-label { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #475569; cursor: pointer; }
.check-input { display: none; }
.check-box { width: 14px; height: 14px; border-radius: 3px; border: 1.5px solid #cbd5e1; flex-shrink: 0; position: relative; }
.check-input:checked + .check-box { background: #3b82f6; border-color: #3b82f6; }
.check-input:checked + .check-box::after { content: ""; position: absolute; left: 4px; top: 1px; width: 4px; height: 8px; border: solid #fff; border-width: 0 1.5px 1.5px 0; transform: rotate(45deg); }
.tool-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; padding: 8px; }
.tool-btn { display: flex; align-items: center; justify-content: center; padding: 8px; background: transparent; border: 1px solid #e2e8f0; border-radius: 4px; color: #64748b; cursor: pointer; transition: all 0.1s; }
.tool-btn:hover { border-color: #cbd5e1; color: #475569; }
.tool-btn.active { border-color: #3b82f6; color: #3b82f6; background: rgba(59,130,246,0.08); }
.results-main { display: flex; flex-direction: column; gap: 16px; }
.radargram-container { position: relative; background: rgba(6, 10, 20, 0.8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; display: flex; align-items: flex-start; gap: 12px; }
.radargram-canvas { width: 100%; height: 400px; border-radius: 4px; display: block; }
.radargram-overlay { position: absolute; top: 16px; left: 16px; right: 16px; }
.overlay-info { display: flex; gap: 16px; font-size: 11px; color: rgba(148, 163, 184, 0.6); background: rgba(6, 10, 20, 0.6); padding: 6px 12px; border-radius: 4px; }
.legend-bar { display: flex; align-items: center; gap: 6px; padding: 4px 0; }
.legend-label { font-size: 10px; color: #475569; }
.legend-gradient { width: 100px; height: 8px; border-radius: 2px; background: linear-gradient(to right, #000, #444, #888, #bbb, #fff); }
.interpretation-panel { background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.target-count { font-size: 11px; color: #3b82f6; font-weight: 500; }
.target-table { padding: 8px 0; }
.target-head, .target-row { display: grid; grid-template-columns: 50px 100px 100px 100px 80px; gap: 4px; padding: 8px 16px; align-items: center; }
.target-head { font-size: 11px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
.target-row { font-size: 12.5px; color: #475569; cursor: default; transition: all 0.1s; }
.target-row:hover { background: rgba(59,130,246,0.04); }
.target-row.highlighted { background: rgba(59,130,246,0.08); }
.tag { display: inline-block; padding: 1px 8px; border-radius: 3px; font-size: 11px; border: 1px solid; background: rgba(100,116,139,0.08); color: #475569; }
.conf-cell { font-family: "SF Mono", monospace; color: #10b981; }
</style>