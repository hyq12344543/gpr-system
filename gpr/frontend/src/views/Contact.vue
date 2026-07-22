<template>
  <div class="page-contact">
    <div class="contact-hero">
      <div class="hero-badge">FEEDBACK</div>
      <h1 class="hero-title">联系与反馈</h1>
      <p class="hero-desc">如在使用过程中遇到任何问题，或有任何建议，欢迎随时与我们联系</p>
    </div>

    <div class="contact-grid">
      <div class="contact-card primary">
        <div class="card-icon-wrap">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/>
          </svg>
        </div>
        <h3>电子邮件</h3>
        <p class="card-detail">1160844067@qq.com</p>
        <p class="card-hint">工作日 24 小时内回复</p>
        <a :href="'mailto:1160844067@qq.com?subject=' + encodeURIComponent('GPR解译系统反馈')" class="contact-action">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M8 3v10M4 9l4 4 4-4"/></svg>
          发送邮件
        </a>
      </div>

      <div class="contact-card">
        <div class="card-icon-wrap" style="color:#8b5cf6;background:rgba(139,92,246,0.08)">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <h3>数据安全</h3>
        <p class="card-detail">所有上传数据加密存储</p>
        <p class="card-hint">ISO 27001 信息安全管理认证</p>
      </div>
    </div>

    <div class="feedback-section">
      <div class="section-header-big">
        <h2>提交反馈</h2>
        <p>帮助我们做得更好</p>
      </div>

      <div class="feedback-card">
        <div class="feedback-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">姓名</label>
              <input v-model="form.name" type="text" class="form-input" placeholder="您的姓名">
            </div>
            <div class="form-group">
              <label class="form-label">邮箱</label>
              <input v-model="form.email" type="email" class="form-input" placeholder="您的联系邮箱">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">反馈类型</label>
            <div class="form-tags">
              <span v-for="t in feedbackTypes" :key="t" class="form-tag" :class="{ active: form.type === t }" @click="form.type = t">{{ t }}</span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">反馈内容</label>
            <textarea v-model="form.message" class="form-textarea" rows="5" placeholder="请详细描述您遇到的问题或建议..."></textarea>
          </div>
          <div class="form-actions">
            <button class="submit-btn" @click="submitFeedback" :disabled="!form.message.trim() || !form.email.trim()">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 10l14-7-7 14-2-5-5-2z"/>
              </svg>
              提交反馈
            </button>
            <span v-if="submitted" class="submit-success">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="#10b981" stroke-width="1.5"><circle cx="10" cy="10" r="7"/><path d="M7 10l2 2 4-4"/></svg>
              感谢您的反馈！
            </span>
          </div>
        </div>

        <div class="faq-section">
          <h3>常见问题</h3>
          <div class="faq-list">
            <div v-for="(faq, i) in faqs" :key="i" class="faq-item" :class="{ open: faqOpen === i }" @click="faqOpen = faqOpen === i ? -1 : i">
              <div class="faq-q">
                <span>{{ faq.q }}</span>
                <svg :class="{ rotated: faqOpen === i }" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6l4 4 4-4"/></svg>
              </div>
              <div v-if="faqOpen === i" class="faq-a">{{ faq.a }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue"
import api from "../api"

const form = reactive({ name: "", email: "", type: "功能建议", message: "" })
const submitted = ref(false)
const faqOpen = ref(-1)

const feedbackTypes = ["功能建议", "问题报告", "数据咨询", "商务合作", "其他"]

const faqs = [
  { q: "支持哪些雷达数据格式？", a: "目前支持 SEG-Y、SEG-2、DZT、RD3、CSV 等主流探地雷达数据格式，以及 JPG、PNG、TIFF 等图像格式。" },
  { q: "上传的数据如何保证安全？", a: "所有上传数据均采用 AES-256 加密存储，服务器通过 ISO 27001 认证，数据传输使用 TLS 1.3 加密协议。" },
  { q: "YOLOv8 模型的识别精度如何？", a: "模型在标准测试集上的 mAP@0.5 达到 86.3%，对管道、空洞、钢筋等目标的识别准确率均在 80% 以上。" },
  { q: "如何处理大批量数据？", a: "支持批量上传和自动队列处理，单次最多可处理 50 个文件。如需处理更大规模数据，建议分批上传。" },
  { q: "解译结果如何导出？", a: "支持导出为 SEG-Y、CSV、PDF 报告、GeoTIFF 等多种格式，可在结果展示页面选择导出。" },
]

function submitFeedback() {
  if (!form.message.trim() || !form.email.trim()) return
  api.post("/feedback/", {
    name: form.name || "匿名",
    email: form.email,
    feedback_type: form.type,
    content: form.message,
  }).then(function() {
    submitted.value = true
    setTimeout(function() { submitted.value = false; form.name = ""; form.email = ""; form.message = "" }, 3000)
  }).catch(function(e) {
    console.error("API error:", e)
  })
}
</script>

<style scoped>
.page-contact { display: flex; flex-direction: column; gap: 32px; padding-top: 8px; }

.contact-hero {
  text-align: center; padding: 32px 20px 8px;
  background: linear-gradient(135deg, #eef2ff 0%, #f0f9ff 50%, #f8fafc 100%);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.08);
}
.hero-badge {
  display: inline-block; padding: 3px 14px; border-radius: 12px;
  font-size: 10px; letter-spacing: 1.5px; font-weight: 600;
  background: rgba(59, 130, 246, 0.08); color: #3b82f6;
  margin-bottom: 12px;
}
.hero-title { font-size: 26px; font-weight: 600; color: #1e293b; letter-spacing: 0.5px; }
.hero-desc { font-size: 13.5px; color: #64748b; margin-top: 8px; max-width: 520px; margin-left: auto; margin-right: auto; }

.contact-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.contact-card {
  background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(203, 213, 225, 0.5); border-radius: 10px;
  padding: 24px; text-align: center;
}
.contact-card.primary {
  border-color: rgba(59, 130, 246, 0.15);
  background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(239, 246, 255, 0.8));
}
.card-icon-wrap {
  width: 48px; height: 48px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 14px; color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
}
.contact-card h3 { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 6px; }
.card-detail { font-size: 13px; color: #475569; }
.card-hint { font-size: 11.5px; color: #94a3b8; margin-top: 4px; }
.contact-action {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 12px; padding: 6px 16px; border-radius: 6px;
  font-size: 12px; font-weight: 500; text-decoration: none;
  background: rgba(59,130,246,0.08); color: #3b82f6;
  transition: all 0.15s; border: 1px solid rgba(59,130,246,0.15);
}
.contact-action:hover { background: rgba(59,130,246,0.12); border-color: rgba(59,130,246,0.25); }

.section-header-big { text-align: center; }
.section-header-big h2 { font-size: 20px; font-weight: 600; color: #1e293b; }
.section-header-big p { font-size: 13px; color: #64748b; margin-top: 4px; }

.feedback-card {
  display: grid; grid-template-columns: 1fr 360px; gap: 20px;
  align-items: start;
}
.feedback-form, .faq-section {
  background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(203, 213, 225, 0.5); border-radius: 10px;
  padding: 24px;
}
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-group { margin-bottom: 14px; }
.form-label { display: block; font-size: 12px; font-weight: 500; color: #475569; margin-bottom: 6px; }
.form-input, .form-textarea {
  width: 100%; padding: 9px 12px; border-radius: 6px;
  background: #ffffff; border: 1px solid #e2e8f0;
  color: #1e293b; font-size: 13px; outline: none;
  font-family: inherit; transition: border-color 0.15s;
}
.form-input:focus, .form-textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.08); }
.form-input::placeholder, .form-textarea::placeholder { color: #94a3b8; }
.form-textarea { resize: vertical; }
.form-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.form-tag {
  padding: 4px 14px; border-radius: 14px; font-size: 12px;
  border: 1px solid #e2e8f0; color: #64748b;
  cursor: pointer; transition: all 0.15s;
}
.form-tag:hover { border-color: #94a3b8; color: #475569; }
.form-tag.active { background: rgba(59,130,246,0.08); border-color: #3b82f6; color: #3b82f6; }
.form-actions { display: flex; align-items: center; gap: 12px; }
.submit-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 24px; border-radius: 6px;
  background: #3b82f6; color: #ffffff;
  border: none; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 0.15s;
}
.submit-btn:hover { background: #2563eb; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.submit-success { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #10b981; }

.faq-section h3 { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 14px; }
.faq-list { display: flex; flex-direction: column; gap: 2px; }
.faq-item { border-bottom: 1px solid #f1f5f9; cursor: pointer; }
.faq-item:last-child { border-bottom: none; }
.faq-q {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0; font-size: 12.5px; color: #475569;
}
.faq-q svg { flex-shrink: 0; transition: transform 0.2s; color: #94a3b8; }
.faq-q svg.rotated { transform: rotate(180deg); }
.faq-a { padding: 0 0 12px; font-size: 12px; color: #64748b; line-height: 1.6; }
</style>