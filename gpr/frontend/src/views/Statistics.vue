<template>
  <div class="page-stats">
    <div class="page-header">
      <h1 class="page-title">统计分析</h1>
      <p class="page-desc">解译结果的统计分析与数据挖掘</p>
    </div>
    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-icon" style="color:#3b82f6;background:rgba(59,130,246,0.08)">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 8v8M15 8v8M3 12h18"/></svg>
        </div>
        <div class="stat-body"><span class="stat-value">1,247</span><span class="stat-label">总处理道数</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="color:#10b981;background:rgba(16,185,129,0.08)">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
        </div>
        <div class="stat-body"><span class="stat-value">35</span><span class="stat-label">识别目标总数</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="color:#f59e0b;background:rgba(245,158,11,0.08)">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 12H4M12 4v16"/></svg>
        </div>
        <div class="stat-body"><span class="stat-value">86.3%</span><span class="stat-label">平均识别准确率</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="color:#8b5cf6;background:rgba(139,92,246,0.08)">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 20h20"/><path d="M4 16l4-8 4 6 4-10 4 8"/></svg>
        </div>
        <div class="stat-body"><span class="stat-value">12</span><span class="stat-label">项目总数</span></div>
      </div>
    </div>
    <div class="charts-grid">
      <div class="chart-card">
        <div class="panel-header"><h3>目标类型分布</h3></div>
        <div class="chart-body">
          <div class="bar-chart">
            <div v-for="(bar, i) in typeDistribution" :key="i" class="bar-item">
              <div class="bar-label">{{ bar.type }}</div>
              <div class="bar-track"><div class="bar-fill" :style="{ width: bar.pct + '%', background: bar.color }"></div></div>
              <div class="bar-value">{{ bar.count }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="chart-card">
        <div class="panel-header"><h3>深度分布直方图</h3></div>
        <div class="chart-body"><canvas ref="histCanvas" class="hist-canvas"></canvas></div>
      </div>
    </div>
    <div class="detail-grid">
      <div class="detail-card">
        <div class="panel-header"><h3>项目统计详情</h3></div>
        <div class="detail-table-wrap">
          <table class="detail-table">
            <thead><tr><th>项目名称</th><th>道数</th><th>目标数</th><th>平均置信度</th><th>最大深度</th><th>状态</th></tr></thead>
            <tbody>
              <tr v-for="(p, i) in projectStats" :key="i">
                <td><span class="detail-name">{{ p.name }}</span></td>
                <td>{{ p.traces }}</td><td>{{ p.targets }}</td><td>{{ (p.confidence * 100).toFixed(1) }}%</td><td>{{ p.maxDepth }} m</td>
                <td><span class="badge-status" :class="p.status">{{ p.status === "verified" ? "已核验" : "待审" }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
const histCanvas = ref(null)
const typeDistribution = ref([
  { type: "管道", count: 14, pct: 100, color: "#10b981" },
  { type: "空洞", count: 10, pct: 71, color: "#f59e0b" },
  { type: "异常体", count: 7, pct: 50, color: "#ef4444" },
  { type: "钢筋", count: 4, pct: 29, color: "#3b82f6" },
])
const projectStats = ref([
  { name: "site_a_line01", traces: 256, targets: 12, confidence: 0.87, maxDepth: 15.6, status: "verified" },
  { name: "site_b_survey", traces: 320, targets: 8, confidence: 0.82, maxDepth: 18.2, status: "pending" },
  { name: "site_c_raw", traces: 400, targets: 15, confidence: 0.84, maxDepth: 12.8, status: "verified" },
  { name: "site_d_road", traces: 180, targets: 5, confidence: 0.79, maxDepth: 8.5, status: "verified" },
  { name: "site_e_tunnel", traces: 500, targets: 20, confidence: 0.91, maxDepth: 25.0, status: "pending" },
])
const depthBins = [
  { range: "0-2m", count: 8 }, { range: "2-4m", count: 12 }, { range: "4-6m", count: 7 },
  { range: "6-8m", count: 5 }, { range: "8-10m", count: 3 }, { range: ">10m", count: 2 },
]
onMounted(() => {
  if (histCanvas.value) {
    const w = histCanvas.value.parentElement.clientWidth - 32; const h = 200
    histCanvas.value.width = w; histCanvas.value.height = h
    const ctx = histCanvas.value.getContext("2d")
    ctx.fillStyle = "#f8fafc"; ctx.fillRect(0, 0, w, h)
    const maxVal = Math.max(...depthBins.map(d => d.count))
    const barW = (w - 40) / depthBins.length; const pad = barW * 0.2
    depthBins.forEach((bin, i) => {
      const barH = (bin.count / maxVal) * (h - 40); const x = 20 + i * barW + pad / 2; const y = h - 30 - barH
      ctx.fillStyle = "rgba(59, 130, 246, 0.7)"; ctx.fillRect(x, y, barW - pad, barH)
      ctx.fillStyle = "#475569"; ctx.font = "10px sans-serif"; ctx.textAlign = "center"
      ctx.fillText(bin.range, 20 + i * barW + barW / 2, h - 10)
      ctx.fillStyle = "#64748b"; ctx.fillText(bin.count, 20 + i * barW + barW / 2, y - 4)
    })
  }
})
</script>

<style scoped>
.page-stats { display: flex; flex-direction: column; gap: 24px; }
.page-header { padding: 8px 0; }
.page-title { font-size: 22px; font-weight: 600; color: #1e293b; letter-spacing: 0.5px; }
.page-desc { font-size: 13px; color: #64748b; margin-top: 4px; }
.stat-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.stat-card { display: flex; align-items: center; gap: 16px; background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; }
.stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-body { display: flex; flex-direction: column; }
.stat-value { font-size: 24px; font-weight: 600; color: #1e293b; font-family: "SF Mono", monospace; }
.stat-label { font-size: 12px; color: #64748b; margin-top: 2px; }
.charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.chart-card { background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.panel-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(241, 245, 249, 0.8); border-bottom: 1px solid #e2e8f0; }
.panel-header h3 { font-size: 12.5px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.8px; }
.chart-body { padding: 16px; }
.bar-chart { display: flex; flex-direction: column; gap: 14px; }
.bar-item { display: grid; grid-template-columns: 60px 1fr 40px; align-items: center; gap: 12px; }
.bar-label { font-size: 13px; color: #475569; }
.bar-track { height: 20px; background: #ffffff; border-radius: 4px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
.bar-value { font-size: 13px; color: #334155; font-family: "SF Mono", monospace; text-align: right; }
.hist-canvas { width: 100%; height: 200px; border-radius: 4px; }
.detail-card { background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.detail-table-wrap { overflow-x: auto; }
.detail-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.detail-table th { padding: 10px 16px; text-align: left; font-size: 11px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; background: rgba(17, 24, 39, 0.3); border-bottom: 1px solid #e2e8f0; }
.detail-table td { padding: 10px 16px; color: #475569; border-bottom: 1px solid #ffffff; }
.detail-table tr:last-child td { border-bottom: none; }
.detail-table tr:hover td { background: rgba(59,130,246,0.03); }
.detail-name { color: #334155; }
.badge-status { display: inline-block; padding: 2px 10px; border-radius: 10px; font-size: 11px; font-weight: 500; }
.badge-status.verified { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
.badge-status.pending { background: rgba(245,158,11,0.1); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2); }
</style>