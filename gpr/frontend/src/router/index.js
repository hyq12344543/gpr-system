import { createRouter, createWebHistory } from "vue-router"
import Interpretation from "../views/Interpretation.vue"
import AiChat from "../views/AiChat.vue"
import Results from "../views/Results.vue"
import Statistics from "../views/Statistics.vue"
import HistoryArchive from "../views/HistoryArchive.vue"
import Contact from "../views/Contact.vue"

const routes = [
  { path: "/", name: "Interpretation", component: Interpretation, meta: { title: "智能解译" } },
  { path: "/ai-chat", name: "AiChat", component: AiChat, meta: { title: "AI问答" } },
  { path: "/results", name: "Results", component: Results, meta: { title: "结果展示" } },
  { path: "/statistics", name: "Statistics", component: Statistics, meta: { title: "统计分析" } },
  { path: "/history", name: "HistoryArchive", component: HistoryArchive, meta: { title: "历史归档" } },
  { path: "/contact", name: "Contact", component: Contact, meta: { title: "联系反馈" } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router