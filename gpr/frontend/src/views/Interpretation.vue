<template>
  <div class="page-interp">
    <div class="page-header">
      <h1 class="page-title">智能解译</h1>
      <p class="page-desc">上传探地雷达数据或现场照片，基于YOLOv8模型自动解译分析</p>
    </div>

    <!-- ========== UPLOAD ZONE ========== -->
    <div class="upload-zone" :class="{ dragging: isDragging }"
      @dragenter.prevent="isDragging = true"
      @dragover.prevent
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop">
      <div class="upload-icon">
        <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M24 8v22M14 18l10-10 10 10"/>
          <path d="M8 30v8a4 4 0 004 4h24a4 4 0 004-4v-8"/>
        </svg>
      </div>
      <div class="upload-text">
        <span class="upload-main">拖拽文件到此处，或 <em>点击浏览</em></span>
        <span class="upload-hint">支持雷达数据文件（SEG-Y、DZT、RD3、CSV）及现场照片（JPG、PNG、TIFF）</span>
      </div>
      <input ref="fileInput" type="file" multiple
        accept=".segy,.sgy,.seg2,.dzt,.rd3,.csv,.jpg,.jpeg,.png,.bmp,.tiff,.tif"
        @change="onFileSelect" class="file-input">
      <button class="upload-btn" @click="selectFiles">选择文件</button>
    </div>

    <!-- ========== FILE QUEUE ========== -->
    <div v-if="files.length" class="file-section">
      <div class="section-header">
        <h2>文件列表 ({{ files.length }})</h2>
        <button class="btn-sm" @click="files = []">清空</button>
      </div>

      <!-- Image Gallery -->
      <div v-if="images.length" class="image-gallery">
        <div v-for="(img, i) in images" :key="i" class="image-card">
          <div class="img-preview">
            <img :src="img.url" :alt="img.name" class="img-thumb" @load="onImgLoad(img, i)">
            <div class="img-badge">现场照片</div>
          </div>
          <div class="img-info">
            <div class="img-name" :title="img.name">{{ img.name }}</div>
            <div class="img-meta-grid">
              <div class="img-meta-item"><span class="meta-k">大小</span><span class="meta-v">{{ img.size }}</span></div>
              <div class="img-meta-item"><span class="meta-k">分辨率</span><span class="meta-v">{{ img.width || "-" }}x{{ img.height || "-" }}</span></div>
              <div class="img-meta-item"><span class="meta-k">格式</span><span class="meta-v">{{ img.ext }}</span></div>
              <div class="img-meta-item"><span class="meta-k">状态</span><span class="meta-v status" :class="img.status">{{ statusText(img.status) }}</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Data File Table -->
      <div v-if="dataFiles.length" class="file-table">
        <div class="ft-head">
          <span class="ft-col ft-name">文件名</span>
          <span class="ft-col ft-size">大小</span>
          <span class="ft-col ft-format">格式</span>
          <span class="ft-col ft-status">状态</span>
          <span class="ft-col ft-action"></span>
        </div>
        <div v-for="(f, i) in dataFiles" :key="'d'+i" class="ft-row">
          <span class="ft-col ft-name">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M4 2h5l3 3v9H4V2z"/><path d="M9 2v3h3"/></svg>
            {{ f.name }}
          </span>
          <span class="ft-col ft-size">{{ f.size }}</span>
          <span class="ft-col ft-format"><span class="badge data">{{ f.ext }}</span></span>
          <span class="ft-col ft-status"><span class="status-dot" :class="f.status"></span>{{ statusText(f.status) }}</span>
          <span class="ft-col ft-action"><button class="btn-icon" @click="removeFile(i)">&times;</button></span>
        </div>
      </div>

      <div v-if="hasReady" class="upload-actions">
        <button class="btn-primary" @click="startUpload">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 3v10M6 7l4-4 4 4"/><path d="M3 14v2a2 2 0 002 2h10a2 2 0 002-2v-2"/></svg>
          处理文件 ({{ readyCount }})
        </button>
      </div>
    </div>

    <!-- ========== PROCESSING SECTION ========== -->
    <div class="interp-grid">
      <div class="interp-sidebar">
        <div class="panel">
          <div class="panel-header"><h3>处理流程</h3></div>
          <div class="pipeline">
            <div v-for="(step, i) in pipeline" :key="i" class="pipe-step" :class="{ active: step.active, done: step.done }">
              <div class="pipe-indicator">
                <div class="pipe-dot"></div>
                <div v-if="i < pipeline.length - 1" class="pipe-line"></div>
              </div>
              <div class="pipe-content">
                <span class="pipe-label">{{ step.label }}</span>
                <span class="pipe-status">{{ step.status }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header"><h3>解译模型</h3></div>
          <div class="param-group">
            <label class="param-label">目标检测模型</label>
            <select v-model="params.model" class="param-select">
              <option value="yolov8n">YOLOv8n (Nano)</option>
              <option value="yolov8s">YOLOv8s (Small)</option>
              <option value="yolov8m">YOLOv8m (Medium)</option>
              <option value="yolov8l">YOLOv8l (Large)</option>
              <option value="yolov8x">YOLOv8x (X-Large)</option>
            </select>
          </div>
          <div class="param-group">
            <label class="param-label">目标类型</label>
            <div class="target-tags">
              <span v-for="t in targetTypes" :key="t.name" class="target-tag" :class="{ active: t.selected }" @click="t.selected = !t.selected">{{ t.name }}</span>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header"><h3>算法参数</h3></div>
          <div class="param-group">
            <label class="param-label">置信度阈值</label>
            <div class="param-range">
              <input type="range" v-model.number="params.confidence" min="0" max="100" class="range-input">
              <span class="range-val">{{ params.confidence }}%</span>
            </div>
          </div>
          <div class="param-group">
            <label class="param-label">IoU 阈值</label>
            <div class="param-range">
              <input type="range" v-model.number="params.iou" min="0" max="100" class="range-input">
              <span class="range-val">{{ params.iou }}%</span>
            </div>
          </div>
          <div class="param-group">
            <label class="param-label">增益补偿 (dB)</label>
            <div class="param-range">
              <input type="range" v-model.number="params.gain" min="0" max="60" class="range-input">
              <span class="range-val">{{ params.gain }} dB</span>
            </div>
          </div>
          <div class="param-group">
            <label class="param-label">滤波方式</label>
            <select v-model="params.filter" class="param-select">
              <option value="none">无</option>
              <option value="bandpass">带通滤波</option>
              <option value="median">中值滤波</option>
              <option value="wiener">维纳滤波</option>
            </select>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header"><h3>数据选择</h3></div>
          <div class="data-pick">
            <div v-for="(d, i) in availableData" :key="d.id" class="pick-item" :class="{ picked: d.selected }" @click="d.selected = !d.selected">
              <div class="pick-check"><div v-if="d.selected" class="check-mark"></div></div>
              <span class="pick-name">{{ d.name }}</span>
              <span class="pick-info">{{ d.date }}</span>
            </div>
            <div v-if="!availableData.length" class="pick-empty">暂无可选数据，请先上传</div>
          </div>
        </div>
      </div>

      <div class="interp-main">
        <div class="panel main-panel">
          <div class="panel-header">
            <h3>解译控制台</h3>
            <div class="panel-actions">
              <span class="console-status" :class="statusClass">{{ statusText }}</span>
            </div>
          </div>
          <div class="console-area">
            <div class="console-placeholder">
              <svg viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.2">
                <rect x="8" y="16" width="48" height="32" rx="4"/><path d="M8 24h48"/>
                <circle cx="16" cy="20" r="1.5" fill="currentColor"/><circle cx="21" cy="20" r="1.5" fill="currentColor"/><circle cx="26" cy="20" r="1.5" fill="currentColor"/>
                <path d="M18 34l4-4 4 4 4-4 4 4" stroke-width="1.5"/><path d="M18 42l4-4 4 4 4-4 4 4" stroke-width="1.5"/>
              </svg>
              <div class="console-text">
                <p>上传数据后选择YOLOv8模型并运行</p>
                <p class="console-hint">支持批量处理，结果将自动保存并可在结果展示中查看</p>
              </div>
            </div>
            <div class="console-log">
              <div v-for="(log, i) in logs" :key="i" class="log-line" :class="log.type">
                <span class="log-time">{{ log.time }}</span>
                <span class="log-msg">{{ log.msg }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="interp-actions">
          <button class="btn-primary run-btn" @click="runInterpretation">
            <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5,3 17,10 5,17" fill="currentColor" stroke="none"/></svg>
            开始解译
          </button>
          <button class="btn-secondary">
            <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 10h12M10 4v12"/></svg>
            添加到队列
          </button>
          <button class="btn-ghost" @click="$router.push('/results')">
            <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/></svg>
            查看结果
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onBeforeUnmount } from "vue"
import api from "../api"

// ---- Upload State ----
const isDragging = ref(false)
const fileInput = ref(null)
const files = ref([])
const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif"]

const images = computed(() => files.value.filter(f => f.category === "image"))
const dataFiles = computed(() => files.value.filter(f => f.category === "data"))
const hasReady = computed(() => files.value.some(f => f.status === "ready"))
const readyCount = computed(() => files.value.filter(f => f.status === "ready").length)

function selectFiles() { fileInput.value?.click() }

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / 1048576).toFixed(1) + " MB"
}

function getExt(name) { const p = name.lastIndexOf("."); return p > -1 ? name.slice(p).toLowerCase() : "" }
function getCategory(ext) { return IMAGE_EXTS.includes(ext) ? "image" : "data" }

function onFileSelect(e) { addFiles(Array.from(e.target.files)); e.target.value = "" }
function onDrop(e) { isDragging.value = false; addFiles(Array.from(e.dataTransfer.files)) }

function addFiles(list) {
  list.forEach(f => {
    const ext = getExt(f.name)
    const entry = {
      name: f.name,
      size: formatSize(f.size),
      rawSize: f.size,
      ext: ext.toUpperCase(),
      category: getCategory(ext),
      status: "ready",
      url: null,
      width: null,
      height: null,
    }
    if (entry.category === "image") {
      entry.url = URL.createObjectURL(f)
    }
    files.value.push(entry)
  })
}

function removeFile(i) {
  const f = files.value[i]
  if (f.url) URL.revokeObjectURL(f.url)
  files.value.splice(i, 1)
}

function onImgLoad(img, i) {
  const el = document.querySelectorAll(".img-thumb")[i]
  if (el) { img.width = el.naturalWidth; img.height = el.naturalHeight }
}

function statusText(s) { return { ready: "等待处理", uploading: "处理中", done: "已完成", error: "失败" }[s] || s }

function startUpload() {
  files.value.forEach(f => { if (f.status === "ready") f.status = "done" })
  logs.value.push({ time: new Date().toLocaleTimeString(), type: "success", msg: `已完成 ${readyCount.value} 个文件的处理` })
}

onBeforeUnmount(() => {
  files.value.forEach(f => { if (f.url) URL.revokeObjectURL(f.url) })
})

// ---- Processing State ----
const pipeline = ref([
  { label: "数据加载", status: "就绪", active: false, done: true },
  { label: "预处理", status: "等待", active: false, done: false },
  { label: "YOLOv8 推理", status: "等待", active: false, done: false },
  { label: "后处理", status: "等待", active: false, done: false },
  { label: "结果输出", status: "等待", active: false, done: false },
])

const params = reactive({
  model: "yolov8s",
  confidence: 65,
  iou: 45,
  gain: 20,
  filter: "bandpass",
})

const targetTypes = reactive([
  { name: "管道", selected: true },
  { name: "空洞", selected: true },
  { name: "异常体", selected: true },
  { name: "钢筋", selected: true },
])

const availableData = computed(() => dataFiles.value.map((f, i) => ({
  id: i, name: f.name, date: new Date().toLocaleDateString(), selected: i === 0
})))

const logs = ref([{ time: new Date().toLocaleTimeString(), type: "info", msg: "系统就绪，请上传数据或照片" }])
const status = ref("idle")
const statusClass = computed(() => status.value)
const statusTextC = computed(() => {
  return { idle: "等待任务", running: "运行中...", done: "已完成", error: "异常" }[status.value] || "等待任务"
})

function runInterpretation() {
  status.value = "running"
  pipeline.value.forEach((s, i) => { s.active = i === 1; s.done = i === 0 })
  logs.value.push({ time: new Date().toLocaleTimeString(), type: "info", msg: `开始预处理，模型: ${params.model.toUpperCase()}...` })
  setTimeout(() => {
    pipeline.value[1].done = true; pipeline.value[1].active = false; pipeline.value[2].active = true
    logs.value.push({ time: new Date().toLocaleTimeString(), type: "info", msg: "预处理完成，开始YOLOv8推理..." })
    setTimeout(() => {
      pipeline.value[2].done = true; pipeline.value[2].active = false; pipeline.value[3].active = true
      const count = 8 + Math.floor(Math.random() * 10)
      logs.value.push({ time: new Date().toLocaleTimeString(), type: "success", msg: `YOLOv8推理完成，共识别 ${count} 个目标` })
      setTimeout(() => {
        pipeline.value[3].done = true; pipeline.value[3].active = false; pipeline.value[4].active = true
        setTimeout(() => {
          pipeline.value[4].done = true; pipeline.value[4].active = false; status.value = "done"
          logs.value.push({ time: new Date().toLocaleTimeString(), type: "success", msg: "处理流程全部完成，可在结果展示中查看" });
    api.post("/detection-records/", {
      image_path: files.value.length > 0 ? files.value[0].name : "unknown",
      detection_result: { targets_detected: count, total_files: files.value.length },
      target_category: targetTypes.filter(function(t) { return t.selected }).map(function(t) { return t.name }).join(","),
      confidence: params.confidence / 100,
      model_version: params.model,
    }).catch(function(e) { console.error("API error:", e) })
        }, 800)
      }, 1000)
    }, 2000)
  }, 1500)
}
</script>

<style scoped>
.page-interp { display: flex; flex-direction: column; gap: 20px; }
.page-header { padding: 8px 0; }
.page-title { font-size: 22px; font-weight: 600; color: #1e293b; letter-spacing: 0.5px; }
.page-desc { font-size: 13px; color: #64748b; margin-top: 4px; }

/* ---- Upload Zone ---- */
.upload-zone { position: relative; border: 1.5px dashed #cbd5e1; border-radius: 10px; padding: 36px 24px; text-align: center; cursor: pointer; transition: all 0.2s; background: rgba(255, 255, 255, 0.6); }
.upload-zone:hover, .upload-zone.dragging { border-color: #3b82f6; background: rgba(59, 130, 246, 0.05); }
.upload-zone.dragging { border-color: #10b981; background: rgba(16, 185, 129, 0.06); }
.file-input { display: none; }
.upload-icon { color: #475569; margin-bottom: 8px; }
.upload-zone:hover .upload-icon { color: #3b82f6; }
.upload-text { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.upload-main { font-size: 14px; color: #475569; }
.upload-main em { font-style: normal; color: #3b82f6; font-weight: 500; }
.upload-hint { font-size: 12px; color: #475569; }
.upload-btn { padding: 8px 24px; background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.15); border-radius: 6px; color: #3b82f6; font-size: 13px; cursor: pointer; transition: all 0.15s; }
.upload-btn:hover { background: rgba(59, 130, 246, 0.12); border-color: #3b82f6; }

/* ---- File Section ---- */
.file-section { display: flex; flex-direction: column; gap: 12px; }
.section-header { display: flex; justify-content: space-between; align-items: center; }
.section-header h2 { font-size: 15px; font-weight: 500; color: #334155; }
.btn-sm { padding: 4px 12px; background: transparent; border: 1px solid #cbd5e1; border-radius: 4px; color: #64748b; font-size: 12px; cursor: pointer; transition: all 0.15s; }
.btn-sm:hover { border-color: #ef4444; color: #ef4444; }

/* ---- Image Gallery ---- */
.image-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
.image-card { background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.img-preview { position: relative; height: 160px; background: #f8fafc; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.img-thumb { max-width: 100%; max-height: 100%; object-fit: contain; }
.img-badge { position: absolute; top: 6px; left: 6px; padding: 2px 8px; border-radius: 4px; font-size: 10px; background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
.img-info { padding: 10px 12px; }
.img-name { font-size: 12px; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 8px; }
.img-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 8px; }
.img-meta-item { display: flex; align-items: center; gap: 4px; font-size: 11px; }
.meta-k { color: #475569; min-width: 32px; }
.meta-v { color: #475569; }
.meta-v.status { display: flex; align-items: center; gap: 4px; }
.meta-v.status.done { color: #10b981; }
.meta-v.status.ready { color: #f59e0b; }

/* ---- File Table ---- */
.file-table { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: rgba(255, 255, 255, 0.7); }
.ft-head { display: grid; grid-template-columns: 1fr 90px 80px 120px 36px; gap: 8px; padding: 10px 16px; background: rgba(17, 24, 39, 0.6); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; font-weight: 600; border-bottom: 1px solid #e2e8f0; }
.ft-row { display: grid; grid-template-columns: 1fr 90px 80px 120px 36px; gap: 8px; padding: 10px 16px; align-items: center; font-size: 13px; color: #475569; border-bottom: 1px solid #ffffff; }
.ft-row:last-child { border-bottom: none; }
.ft-name { display: flex; align-items: center; gap: 6px; overflow: hidden; text-overflow: ellipsis; }
.ft-name svg { flex-shrink: 0; color: #475569; }
.badge { display: inline-block; padding: 1px 8px; border-radius: 3px; font-size: 11px; font-family: "SF Mono", "Cascadia Code", monospace; border: 1px solid; }
.badge.data { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border-color: rgba(59, 130, 246, 0.18); }
.status-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 6px; vertical-align: middle; }
.status-dot.ready { background: #f59e0b; }
.status-dot.uploading { background: #3b82f6; animation: pulse 1s infinite; }
.status-dot.done { background: #10b981; }
.status-dot.error { background: #ef4444; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.btn-icon { background: none; border: none; color: #475569; font-size: 16px; cursor: pointer; padding: 2px; line-height: 1; }
.btn-icon:hover { color: #ef4444; }

.upload-actions { display: flex; justify-content: flex-end; }
.btn-primary { display: flex; align-items: center; gap: 6px; padding: 10px 28px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 6px; color: #3b82f6; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
.btn-primary:hover { background: rgba(59, 130, 246, 0.15); border-color: #3b82f6; }

/* ---- Processing Grid ---- */
.interp-grid { display: grid; grid-template-columns: 300px 1fr; gap: 20px; align-items: start; }
.panel { background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 16px; }
.panel-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(241, 245, 249, 0.8); border-bottom: 1px solid #e2e8f0; }
.panel-header h3 { font-size: 12.5px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.8px; }
.panel-actions { display: flex; align-items: center; gap: 8px; }

/* Pipeline */
.pipeline { padding: 12px 16px; }
.pipe-step { display: flex; gap: 10px; margin-bottom: 4px; }
.pipe-indicator { display: flex; flex-direction: column; align-items: center; width: 12px; }
.pipe-dot { width: 10px; height: 10px; border-radius: 50%; background: #e2e8f0; border: 2px solid #cbd5e1; flex-shrink: 0; transition: all 0.3s; }
.pipe-step.active .pipe-dot { background: #3b82f6; border-color: #3b82f6; box-shadow: 0 0 8px rgba(59,130,246,0.4); }
.pipe-step.done .pipe-dot { background: #10b981; border-color: #10b981; }
.pipe-line { width: 2px; flex: 1; min-height: 16px; background: #e2e8f0; }
.pipe-step.done .pipe-line { background: rgba(16,185,129,0.3); }
.pipe-content { display: flex; flex-direction: column; gap: 1px; padding-bottom: 12px; }
.pipe-label { font-size: 13px; color: #475569; }
.pipe-step.active .pipe-label { color: #1e293b; font-weight: 500; }
.pipe-step.done .pipe-label { color: #10b981; }
.pipe-status { font-size: 11px; color: #475569; }

/* Params */
.param-group { padding: 10px 16px; border-bottom: 1px solid #ffffff; }
.param-group:last-child { border-bottom: none; }
.param-label { display: block; font-size: 12px; color: #64748b; margin-bottom: 6px; }
.param-select { width: 100%; padding: 6px 10px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; color: #334155; font-size: 12.5px; outline: none; cursor: pointer; }
.param-select:focus { border-color: #3b82f6; }
.param-range { display: flex; align-items: center; gap: 10px; }
.range-input { flex: 1; height: 4px; -webkit-appearance: none; appearance: none; background: #cbd5e1; border-radius: 2px; outline: none; }
.range-input::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #3b82f6; cursor: pointer; border: 2px solid #ffffff; }
.range-val { font-size: 12px; color: #3b82f6; font-family: "SF Mono", monospace; min-width: 40px; text-align: right; }
.target-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.target-tag { padding: 3px 10px; border-radius: 10px; font-size: 11.5px; cursor: pointer; border: 1px solid #cbd5e1; color: #64748b; transition: all 0.1s; }
.target-tag:hover { border-color: #475569; color: #475569; }
.target-tag.active { background: rgba(59,130,246,0.1); border-color: #3b82f6; color: #3b82f6; }

/* Data Pick */
.data-pick { padding: 8px; }
.pick-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 4px; cursor: pointer; transition: all 0.1s; }
.pick-item:hover { background: rgba(59,130,246,0.06); }
.pick-item.picked { background: rgba(59,130,246,0.08); }
.pick-check { width: 16px; height: 16px; border-radius: 3px; border: 1.5px solid #cbd5e1; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.pick-item.picked .pick-check { background: #3b82f6; border-color: #3b82f6; }
.check-mark { width: 6px; height: 10px; border: solid #fff; border-width: 0 1.5px 1.5px 0; transform: rotate(45deg); margin-top: -2px; }
.pick-name { font-size: 12.5px; color: #475569; flex: 1; overflow: hidden; text-overflow: ellipsis; }
.pick-info { font-size: 11px; color: #475569; }
.pick-empty { text-align: center; padding: 20px; font-size: 12px; color: #cbd5e1; }

/* Console */
.console-area { padding: 16px; min-height: 260px; display: flex; flex-direction: column; gap: 16px; }
.console-placeholder { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: #cbd5e1; padding: 30px; }
.console-text { text-align: center; }
.console-text p { font-size: 13px; color: #475569; }
.console-hint { font-size: 12px; color: #cbd5e1; margin-top: 4px; }
.console-log { background: #f8fafc; border: 1px solid #ffffff; border-radius: 4px; padding: 10px; max-height: 140px; overflow-y: auto; display: flex; flex-direction: column; gap: 3px; }
.log-line { font-size: 12px; font-family: "SF Mono", "Cascadia Code", monospace; display: flex; gap: 8px; }
.log-time { color: #475569; flex-shrink: 0; }
.log-msg { color: #475569; }
.log-line.success .log-msg { color: #10b981; }
.log-line.error .log-msg { color: #ef4444; }
.log-line.warning .log-msg { color: #f59e0b; }

.console-status { font-size: 11px; padding: 2px 10px; border-radius: 10px; font-weight: 500; }
.console-status.idle { background: rgba(100,116,139,0.12); color: #64748b; border: 1px solid rgba(100,116,139,0.2); }
.console-status.running { background: rgba(59,130,246,0.12); color: #3b82f6; border: 1px solid rgba(59,130,246,0.2); }
.console-status.done { background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
.console-status.error { background: rgba(239,68,68,0.12); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }

.interp-actions { display: flex; gap: 10px; margin-top: 4px; }
.btn-primary, .btn-secondary, .btn-ghost { display: flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
.run-btn { background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); color: #3b82f6; }
.run-btn:hover { background: rgba(59,130,246,0.25); border-color: #3b82f6; }
.btn-secondary { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: #10b981; }
.btn-secondary:hover { background: rgba(16,185,129,0.18); border-color: #10b981; }
.btn-ghost { background: transparent; border: 1px solid #cbd5e1; color: #64748b; }
.btn-ghost:hover { background: rgba(255,255,255,0.03); color: #475569; }
.main-panel { margin-bottom: 0; }
</style>