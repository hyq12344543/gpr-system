<template>
  <div class="page-aichat">
    <div class="page-header">
      <h1 class="page-title">AI问答</h1>
      <p class="page-desc">针对探地雷达数据与解译结果，自由提问获取专业分析建议</p>
    </div>

    <div class="context-bar">
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.2">
        <circle cx="8" cy="8" r="6"/><path d="M8 5v4M8 11v.01"/>
      </svg>
      <span>当前数据：site_a_line01.sgy（256道 / 200ns 时窗）</span>
    </div>

    <div class="chat-container" ref="chatContainer">
      <div v-for="(msg, i) in messages" :key="i" class="msg-row" :class="msg.role">
        <div class="msg-avatar">
          <svg v-if="msg.role === 'assistant'" viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="14" height="14" rx="3"/><path d="M8 14l-3 3"/><path d="M10 7v4M8 9h4"/>
          </svg>
          <svg v-else viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="10" cy="7" r="3"/><path d="M5 16c0-2.5 2-4 5-4s5 1.5 5 4"/>
          </svg>
        </div>
        <div class="msg-content">
          <div class="msg-bubble" v-html="renderMarkdown(msg.text)"></div>
          <div class="msg-time">{{ msg.time }}</div>
        </div>
      </div>

      <div v-if="isTyping" class="msg-row assistant">
        <div class="msg-avatar">
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="14" height="14" rx="3"/><path d="M8 14l-3 3"/><path d="M10 7v4M8 9h4"/>
          </svg>
        </div>
        <div class="msg-content">
          <div class="typing-indicator"><span></span><span></span><span></span></div>
        </div>
      </div>
    </div>

    <div class="input-area">
      <div class="quick-prompts">
        <button v-for="(q, i) in quickPrompts" :key="i" class="prompt-btn" @click="sendMessage(q.text)">
          {{ q.label }}
        </button>
      </div>
      <div class="input-row">
        <input v-model="inputText" type="text" class="chat-input" placeholder="输入关于探地雷达数据的问题..." @keyup.enter="sendMessage(inputText)">
        <button class="send-btn" @click="sendMessage(inputText)" :disabled="!inputText.trim()">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 10l14-7-7 14-2-5-5-2z"/>
          </svg>
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue"
import api from "../api"

const inputText = ref("")
const isTyping = ref(false)
const chatContainer = ref(null)

const messages = ref([
  {
    role: "assistant",
    text: "你好！我是GPR解译助手。你可以针对当前加载的探地雷达数据提问，例如目标识别、异常分析、地质解释等。有什么可以帮你的？",
    time: "14:30:00"
  }
])

const quickPrompts = [
  { label: "异常信号分析", text: "请分析当前数据中的异常信号特征" },
  { label: "目标识别结果", text: "当前数据中识别出了哪些类型的目标？" },
  { label: "地质解释建议", text: "根据雷达剖面特征，给出地质解释建议" },
  { label: "数据质量评估", text: "评估当前数据采集质量及预处理建议" },
]

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  })
}

function renderMarkdown(text) {
  return text
    .replace(/## (.+)/g, "<h4>$1</h4>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>")
}

const responseDB = {
  "异常信号分析": "## 异常信号分析结果\n\n根据当前雷达剖面数据，共识别出 **3处异常信号**：\n\n1. **位置 34道 / 2.15m** - 双曲线反射特征，疑似地下管道信号，信噪比 0.92\n2. **位置 78道 / 5.34m** - 强振幅异常，伴有多次波，疑似空洞信号，信噪比 0.87\n3. **位置 145道 / 7.89m** - 不规则反射界面，疑似异常体，信噪比 0.76\n\n**建议**：对异常2进行进一步验证，建议采用低频天线进行复测。",
  "目标识别结果": "## 目标识别结果\n\n基于YOLOv8模型检测，当前数据中共识别出 **6个目标**：\n\n| 类型 | 数量 | 平均置信度 |\n|---|---|---|\n| 管道 | 2 | 88.0% |\n| 空洞 | 2 | 84.0% |\n| 异常体 | 1 | 76.0% |\n| 钢筋 | 1 | 95.0% |\n\n**高置信度目标**：钢筋（95%）和管道（92%），均为典型双曲线反射特征。",
  "地质解释建议": "## 地质解释建议\n\n根据雷达剖面反射特征分析：\n\n1. **浅层（0-3m）**：层状反射结构清晰，显示回填土层分布均匀，未见明显扰动\n2. **中层（3-6m）**：存在双曲线反射，推断为 **管线分布区**，建议结合管线图纸验证\n3. **深层（6-10m）**：反射信号衰减明显，存在一处 **异常反射体**，需关注\n\n**整体评价**：该测线地质条件中等，适合开展管线和空洞探测。",
  "数据质量评估": "## 数据质量评估\n\n| 指标 | 结果 | 评价 |\n|---|---|---|\n| 信噪比 | 28.5 dB | 良好 |\n| 采样点数 | 512 | 满足要求 |\n| 时窗覆盖 | 200 ns | 探测深度约15m |\n| 道间距 | 0.05 m | 分辨率适中 |\n\n**预处理建议**：\n- 建议应用带通滤波（60-300MHz）压制低频噪声\n- 增益补偿建议设为 20dB，均衡深部信号\n- 可尝试中值滤波去除随机噪声",
}

function getResponse(question) {
  for (const [key, response] of Object.entries(responseDB)) {
    if (question.includes(key) || question.includes(key.slice(0, 4))) {
      return response
    }
  }
  const defaultResponses = [
    "## 分析说明\n\n根据探地雷达数据特征，对该问题分析如下：\n\n当前数据采集于标准测线，使用 **200MHz屏蔽天线**，道间距0.05m，时窗200ns。数据整体质量良好，适合进行精细解译。\n\n针对您提出的问题，建议结合以下信息综合判断：\n1. 查看 **结果展示** 页面的雷达剖面图\n2. 参考 **统计分析** 中的目标分布结果\n3. 与已有地质资料进行对比验证\n\n如需更具体的分析，请提供更多细节信息。",
    "## GPR技术参考\n\n探地雷达（Ground Penetrating Radar, GPR）是一种利用高频电磁波探测地下目标的无损检测技术。\n\n**基本原理**：发射天线向地下发射高频电磁波（通常10MHz-2GHz），电磁波在地下介质中传播时，遇到介电常数差异的界面会发生反射，接收天线记录反射波信号。\n\n**关键参数**：\n- 天线频率：决定探测深度和分辨率，频率越低探测越深但分辨率越低\n- 时窗：决定最大探测深度\n- 采样点数：影响数据纵向分辨率\n\n**常见应用**：管线探测、空洞检测、道路病害检测、隧道衬砌检测、考古勘探等。",
    "## 数据处理建议\n\n对于当前探地雷达数据，推荐以下处理流程：\n\n1. **预处理**：去直流漂移、增益补偿、带通滤波\n2. **常规处理**：反褶积、偏移处理（提高横向分辨率）\n3. **高级处理**：属性分析、三维可视化\n\n**推荐参数**：\n- 带通滤波：下限60MHz，上限300MHz\n- 增益：AGC或SEC增益，时窗增益20dB\n- 偏移：Kirchhoff偏移或F-K偏移\n\n处理后可在 **智能解译** 页面对数据进行分析，在 **结果展示** 页面查看解译结果。",
  ]
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
}

function sendMessage(text) {
  if (!text.trim()) return
  const now = new Date().toLocaleTimeString()
  messages.value.push({ role: "user", text: text.trim(), time: now })
  inputText.value = ""
  scrollToBottom()

  isTyping.value = true
  setTimeout(() => {
    isTyping.value = false
    var respText = getResponse(text.trim()); messages.value.push({ role: "assistant", text: respText, time: new Date().toLocaleTimeString() });
    api.post("/qa-history/", {
      question: text.trim(),
      answer: respText,
      related_image_id: null,
      qa_type: "智能解译",
    }).catch(function(e) { console.error("API error:", e) })
    scrollToBottom()
  }, 1500 + Math.random() * 1000)
}

onMounted(() => { scrollToBottom() })
</script>

<style scoped>
.page-aichat { display: flex; flex-direction: column; gap: 16px; height: calc(100vh - 110px); }
.page-header { padding: 8px 0; flex-shrink: 0; }
.page-title { font-size: 22px; font-weight: 600; color: #1e293b; letter-spacing: 0.5px; }
.page-desc { font-size: 13px; color: #64748b; margin-top: 4px; }

.context-bar {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 14px; background: rgba(59,130,246,0.06); border: 1px solid rgba(59,130,246,0.12);
  border-radius: 6px; font-size: 12px; color: #3b82f6; flex-shrink: 0;
}

.chat-container {
  flex: 1; overflow-y: auto;
  display: flex; flex-direction: column; gap: 16px;
  padding: 16px; background: rgba(6, 10, 20, 0.4); border: 1px solid #e2e8f0; border-radius: 8px;
}
.msg-row { display: flex; gap: 10px; max-width: 85%; }
.msg-row.user { flex-direction: row-reverse; align-self: flex-end; }
.msg-avatar {
  width: 32px; height: 32px; border-radius: 6px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.msg-row.assistant .msg-avatar { background: rgba(59,130,246,0.12); color: #3b82f6; }
.msg-row.user .msg-avatar { background: rgba(16,185,129,0.12); color: #10b981; }
.msg-content { display: flex; flex-direction: column; gap: 4px; }
.msg-bubble {
  padding: 10px 14px; border-radius: 8px; font-size: 13px; line-height: 1.6;
}
.msg-row.assistant .msg-bubble {
  background: rgba(255, 255, 255, 0.9); border: 1px solid #e2e8f0; color: #334155;
}
.msg-row.user .msg-bubble {
  background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.2); color: #1e293b;
}
.msg-bubble :deep(h4) { font-size: 14px; color: #1e293b; margin: 8px 0 4px; }
.msg-bubble :deep(h4:first-child) { margin-top: 0; }
.msg-bubble :deep(code) { font-family: "SF Mono", monospace; font-size: 11px; color: #10b981; background: rgba(16,185,129,0.08); padding: 1px 5px; border-radius: 3px; }
.msg-bubble :deep(strong) { color: #1e293b; }
.msg-bubble :deep(table) { width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 12px; }
.msg-bubble :deep(td), .msg-bubble :deep(th) { padding: 4px 10px; border: 1px solid #e2e8f0; text-align: left; }
.msg-bubble :deep(th) { background: rgba(17,24,39,0.5); color: #475569; font-weight: 600; }
.msg-bubble :deep(td) { color: #475569; }
.msg-time { font-size: 10px; color: #cbd5e1; padding: 0 4px; }

.typing-indicator { display: flex; gap: 4px; padding: 10px 14px; align-items: center; }
.typing-indicator span { width: 6px; height: 6px; border-radius: 50%; background: #3b82f6; animation: bounce 1.2s infinite; }
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce { 0%, 60%, 100% { opacity: 0.3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-4px); } }

.input-area { flex-shrink: 0; display: flex; flex-direction: column; gap: 8px; }
.quick-prompts { display: flex; gap: 8px; flex-wrap: wrap; }
.prompt-btn {
  padding: 5px 14px; border-radius: 14px; font-size: 11.5px;
  background: rgba(59,130,246,0.06); border: 1px solid rgba(59,130,246,0.15);
  color: #3b82f6; cursor: pointer; transition: all 0.15s;
}
.prompt-btn:hover { background: rgba(59,130,246,0.12); border-color: rgba(59,130,246,0.3); }
.input-row { display: flex; gap: 8px; }
.chat-input {
  flex: 1; padding: 10px 14px; border-radius: 8px;
  background: #ffffff; border: 1px solid #cbd5e1; color: #1e293b;
  font-size: 13px; outline: none;
}
.chat-input:focus { border-color: #3b82f6; }
.chat-input::placeholder { color: #cbd5e1; }
.send-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 20px; border-radius: 8px;
  background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3);
  color: #3b82f6; font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all 0.15s;
}
.send-btn:hover:not(:disabled) { background: rgba(59,130,246,0.25); border-color: #3b82f6; }
.send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>