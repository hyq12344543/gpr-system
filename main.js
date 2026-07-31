/* ===== TunnelRadar 共享脚本 ===== */

/* 导航高亮 */
document.addEventListener('DOMContentLoaded', function () {
  var path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
});

/* 通用：Tab 切换 */
function switchTab(tabId) {
  var btn = document.querySelector('.tab-btn[data-tab="' + tabId + '"]');
  if (!btn) return;
  document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.querySelectorAll('.tab-panel').forEach(function (p) { p.style.display = 'none'; });
  var panel = document.querySelector('.tab-panel[data-panel="' + tabId + '"]');
  if (panel) panel.style.display = 'block';
}

/* ===== GPR 隧道检测知识库（客户端问答） ===== */
var KNOWLEDGE = [
  {
    k: ['脱空', '衬砌脱空', '脱空识别', '脱空特征'],
    a: '隧道衬砌脱空在 GPR 剖面上具有以下典型特征：\n1. 反射特征：脱空区域产生强反射信号，振幅明显高于密实区域，反射同相轴连续性好\n2. 相位特征：脱空界面反射波相位与入射波相反（正负反转）\n3. 波形特征：呈现"亮斑"或"强反射带"，内部多次反射明显\n4. 边界特征：脱空区两侧边缘常伴有双曲线绕射波\n5. 后续效应：脱空区下方信号衰减加快\n\n建议结合钻芯验证进行标定，脱空区反射振幅较密实区增强 3-5 倍以上。',
    r: ['《公路隧道检测技术规范》JTG 3450', 'GPR 隧道衬砌检测指南']
  },
  {
    k: ['天线频率', '频率选择', '900MHz', '1.5GHz', '天线'],
    a: '900 MHz 与 1.5 GHz 天线适用场景对比：\n\n900 MHz 天线：\n- 适用深度：0.5~3.0m（覆盖二衬+初衬）\n- 分辨率：中，可识别 >10cm 病害\n- 推荐用途：衬砌脱空检测、空洞探测、仰拱检测\n\n1.5 GHz 天线：\n- 适用深度：0.2~1.5m（主要二衬）\n- 分辨率：高，可识别 >3cm 病害\n- 推荐用途：二衬厚度检测、钢筋分布检测\n\n建议：条件允许时双频联合检测。',
    r: ['《地质雷达检测技术规程》', '天线选型工程手册']
  },
  {
    k: ['钢筋', '钢筋干扰', '干扰压制', '钢筋识别'],
    a: '钢筋是隧道衬砌检测中最常见的干扰源：\n\n识别特征：\n1. 钢筋反射呈连续双曲线形态，顶点在钢筋位置\n2. 相邻钢筋双曲线相互重叠形成波浪状图案\n3. 钢筋层下方信号严重衰减形成"屏蔽区"\n\n压制方法：\n1. FK 滤波：在频率-波数域去除周期性信号（最有效）\n2. 背景去除：减去相邻道平均信号\n3. 中值滤波：沿测线压制双曲线绕射尾巴\n4. 偏移处理：Kirchhoff 偏移将双曲线收敛为点状',
    r: ['GPR 信号处理手册', '《隧道衬砌地质雷达检测技术标准》']
  },
  {
    k: ['不密实', '密实度', '波形区别'],
    a: '衬砌不密实区与脱空在 GPR 波形上的主要区别：\n\n脱空（空气充填）：\n- 反射振幅强（入射波 3-5 倍）\n- 反射极性正负反转\n- 反射波尖锐清晰，多次反射明显\n- 下方信号严重衰减\n\n不密实区（低密度充填）：\n- 反射振幅中等（1.5-2.5 倍）\n- 反射极性不变或轻微变化\n- 反射波较宽模糊，多次反射不显著\n- 下方信号部分衰减\n\n建议结合振幅比、极性分析和频谱特征综合判断。',
    r: ['隧道衬砌质量检测规范', 'GPR 波形解译图集']
  },
  {
    k: ['仰拱', '仰拱检测', '探测参数'],
    a: '隧道仰拱检测推荐探测参数：\n\n天线频率：首选 400 MHz，次选 200 MHz\n\n采集参数：\n- 时窗：200~400 ns\n- 采样点数：512~1024\n- 道间距：0.1~0.2 m\n- 叠加次数：16~32 次\n\n增益设置：SEC 增益 1.5~2.5 dB/ns，配合 AGC 辅助显示\n\n常见病害：仰拱厚度不足、仰拱脱空、底部虚渣、仰拱积水。',
    r: ['《铁路隧道仰拱检测技术规程》', 'GPR 隧道工程检测应用指南']
  },
  {
    k: ['置信度', '可靠性', '评估', '准确率'],
    a: 'GPR 隧道检测结果可靠性评估方法：\n\n定量指标：\n- 信噪比 SNR > 20 dB 为优质数据\n- 同相轴连续性 > 80% 为可靠解译\n- 异常体振幅比 > 2.5 倍为显著异常\n- 钻孔验证符合率 > 85% 为高置信度\n\n置信度分级：\n- A 级（>90%）：多频率验证+钻孔标定\n- B 级（75-90%）：单一频率+特征明显\n- C 级（50-75%）：特征模糊+无验证\n\n建议对 C 级及以下结论注明不确定性。',
    r: ['《工程物探成果质量评定标准》', 'GPR 解译可靠性评估方法']
  },
  {
    k: ['预处理', '数据处理', 'Dewow', '滤波', '增益'],
    a: 'GPR 数据预处理标准流程：\n\n1. 数据编辑：去除首尾无效道、零漂校正\n2. Dewow 滤波：时窗 1.0~1.5 倍发射脉冲周期\n3. 背景去除：减去所有道平均信号\n4. 带通滤波：通带 0.5~2.0 倍中心频率\n5. 增益恢复：SEC 增益 1.0~3.0 dB/ns\n6. 偏移成像：Kirchhoff 或 F-K 偏移，速度 0.10~0.15 m/ns',
    r: ['GPR 数据处理标准流程', '《探地雷达数据处理规范》']
  },
  {
    k: ['空洞', '背后空洞', '空洞识别'],
    a: '隧道衬砌背后空洞的 GPR 识别特征：\n\n1. 强反射界面：空洞顶界面呈强振幅反射\n2. 多次反射：空洞内部产生"振铃"图案\n3. 绕射波：空洞边缘有双曲线绕射波\n4. 界面反转：空洞底面反射与顶面极性相同\n5. 频率降低：空洞区域主频明显降低\n\n尺寸估算：h = v × Δt / 2，v 取空气速度 0.3 m/ns',
    r: ['《隧道衬砌质量检测与评定标准》', 'GPR 空洞识别技术指南']
  },
  {
    k: ['厚度', '二衬厚度', '衬砌厚度'],
    a: '隧道二衬厚度检测方法与精度：\n\n原理：利用电磁波在二衬与初衬界面反射旅行时计算：h = v × Δt / 2\n\n精度控制：\n1. 速度标定：通过已知厚度段或钻芯标定\n2. 界面识别：信噪比 > 15 dB\n3. 测量精度：典型误差 ±5~10 mm\n\n推荐参数：1.5 GHz 天线，时窗 30~60 ns，采样 512。\n\n厚度不足判据：d < D-10 mm 判定厚度不足，d < D-20 mm 判定严重不足。',
    r: ['《铁路隧道衬砌厚度检测评定标准》']
  },
  {
    k: ['介电常数', '波速', '电磁波', '速度'],
    a: '混凝土介电常数与电磁波速度关系：\n\nv = c / √εr（c=0.3 m/ns）\n\n常见材料：\n- 干燥混凝土：εr=6~9，v=0.10~0.12 m/ns\n- 潮湿混凝土：εr=10~15，v=0.077~0.095 m/ns\n- 空气：εr=1，v=0.3 m/ns\n- 水：εr=81，v=0.033 m/ns\n\n注意：现场检测前必须进行速度标定，否则厚度计算误差可达 20% 以上。',
    r: ['《岩土工程介电常数测量标准》', 'GPR 速度分析方法']
  },
  {
    k: ['测线', '测线布置', '测网'],
    a: '隧道衬砌 GPR 检测测线布置方案：\n\n基本要求：\n- 纵向测线：沿隧道走向，每侧边墙 1~2 条\n- 环向测线：间距 5~10 m\n- 拱部测线：拱顶和拱腰各 1~2 条\n\n具体方案：\n- 高铁隧道：拱顶1+拱腰2+边墙2 = 5条\n- 公路隧道：拱顶1+拱腰2 = 3条\n- 环向间距：普查10~20m，详查5m，病害追踪1~2m',
    r: ['《隧道工程地质雷达检测技术规程》']
  },
  {
    k: ['增益', 'AGC', 'SEC', '增益设置'],
    a: 'SEC 增益与 AGC 增益选择：\n\nSEC 增益（保幅处理）：\n- 系数 1.0~3.0 dB/ns\n- 保留真实振幅，利于定量分析\n- 深层噪声同时放大\n\nAGC 增益（均衡显示）：\n- 时窗 20~50 ns\n- 显示均衡，便于目视解译\n- 破坏振幅关系，不利于定量分析\n\n推荐：现场用低 SEC（1.0~1.5），处理用 SEC（2.0~3.0），显示配 AGC（30ns）。',
    r: ['GPR 增益方法对比研究', '《探地雷达数据处理技术规范》']
  }
];

var DEFAULT_ANSWER = '关于您的问题，当前知识库中没有找到完全匹配的内容。\n\n建议您：\n1. 尝试换一种问法，或使用更具体的关键词\n2. 查阅页面内的"推荐问题"列表\n3. 在"社区交流"板块发起讨论\n\n可查询话题：衬砌脱空识别、天线频率选择、数据处理流程、钢筋干扰压制、仰拱检测等。';

function findAnswer(msg) {
  var m = msg.toLowerCase();
  var best = null, bestScore = 0;
  KNOWLEDGE.forEach(function (item) {
    var score = 0;
    item.k.forEach(function (kw) { if (m.indexOf(kw) !== -1) score++; });
    if (score > bestScore) { bestScore = score; best = item; }
  });
  if (bestScore > 0 && best) {
    return { text: best.a, refs: best.r, conf: Math.min(50 + bestScore * 10, 98) };
  }
  return { text: DEFAULT_ANSWER, refs: ['TunnelRadar 知识库'], conf: 30 };
}

/* ===== AI 聊天页面逻辑 ===== */
function initChat() {
  var sendBtn = document.getElementById('sendBtn');
  var input = document.getElementById('chatInput');
  var box = document.getElementById('chatMsgs');
  if (!sendBtn || !box) return;

  function addMsg(role, text, refs) {
    var div = document.createElement('div');
    div.className = 'msg ' + role;
    var av = document.createElement('div');
    av.className = 'avatar';
    av.textContent = role === 'ai' ? 'AI' : 'U';
    var body = document.createElement('div');
    body.className = 'bubble';
    body.textContent = text;
    div.appendChild(av);
    div.appendChild(body);
    if (refs && refs.length) {
      var refDiv = document.createElement('div');
      refDiv.className = 'refs';
      refs.forEach(function (r) {
        var s = document.createElement('span');
        s.className = 'ref-tag';
        s.textContent = r;
        refDiv.appendChild(s);
      });
      body.appendChild(refDiv);
    }
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  function send() {
    var t = (input.value || '').trim();
    if (!t) return;
    addMsg('user', t);
    input.value = '';
    setTimeout(function () {
      var r = findAnswer(t);
      addMsg('ai', r.text + '\n\n（匹配置信度：' + r.conf + '%）', r.refs);
    }, 600);
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });
  document.querySelectorAll('.suggestions li').forEach(function (li) {
    li.addEventListener('click', function () { input.value = li.textContent.trim(); send(); });
  });
}

/* ===== 智能解译页面逻辑 ===== */
function initInterp() {
  var zone = document.getElementById('importZone');
  var fileInput = document.getElementById('fileInput');
  var preview = document.getElementById('filePreview');
  var startBtn = document.getElementById('startBtn');
  var progressBar = document.getElementById('progressBar');
  var progressText = document.getElementById('progressText');
  var resultBox = document.getElementById('resultBox');
  if (!zone || !fileInput) return;

  var fileName = '';

  zone.addEventListener('click', function () { fileInput.click(); });
  zone.addEventListener('dragover', function (e) { e.preventDefault(); });
  zone.addEventListener('drop', function (e) {
    e.preventDefault();
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', function () { if (fileInput.files.length) handleFile(fileInput.files[0]); });

  function handleFile(f) {
    fileName = f.name;
    preview.style.display = 'block';
    document.getElementById('fileName').textContent = f.name;
    document.getElementById('fileSize').textContent = (f.size / 1024 / 1024).toFixed(1) + ' MB';
    if (f.type.indexOf('image') !== -1) {
      var img = document.getElementById('imagePreview');
      img.src = URL.createObjectURL(f);
      img.style.display = 'block';
      document.getElementById('radarSVG').style.display = 'none';
    } else {
      document.getElementById('imagePreview').style.display = 'none';
      document.getElementById('radarSVG').style.display = 'block';
    }
    startBtn.disabled = false;
  }

  startBtn.addEventListener('click', function () {
    if (!fileName) return;
    startBtn.disabled = true;
    resultBox.innerHTML = '';
    var steps = [
      '读取文件头，解析采集参数...',
      '背景噪声去除完成',
      '带通滤波处理中...',
      'AI 模型推理：同相轴追踪与目标识别...',
      '异常检测与置信度筛选...',
      '成果合成，生成解译报告...',
      '解译完成！'
    ];
    var p = 0, i = 0;
    var timer = setInterval(function () {
      p += Math.floor(Math.random() * 5) + 3;
      if (p > 100) p = 100;
      progressBar.style.width = p + '%';
      progressText.textContent = steps[i] || steps[steps.length - 1];
      if (p >= (i + 1) * 14 && i < steps.length - 1) i++;
      if (p >= 100) {
        clearInterval(timer);
        var picks = 24 + Math.floor(Math.random() * 8);
        var anomalies = 3 + Math.floor(Math.random() * 4);
        var conf = 85 + Math.floor(Math.random() * 8);
        resultBox.innerHTML =
          '<h3>解译完成</h3>' +
          '<div class="stats-row" style="margin-top:12px">' +
          '<div class="stat-card"><div class="stat-value">' + picks + '</div><div class="stat-label">同相轴</div></div>' +
          '<div class="stat-card"><div class="stat-value">' + anomalies + '</div><div class="stat-label">异常目标</div></div>' +
          '<div class="stat-card"><div class="stat-value">' + Math.max(4, Math.floor(anomalies / 2)) + '</div><div class="stat-label">层位</div></div>' +
          '<div class="stat-card"><div class="stat-value">' + conf + '%</div><div class="stat-label">平均置信度</div></div>' +
          '</div>' +
          '<button class="btn btn-outline btn-sm" style="margin-right:6px">查看详细报告</button>' +
          '<button class="btn btn-outline btn-sm">导出解译成果</button>';
        startBtn.disabled = false;
      }
    }, 300);
  });
}

/* ===== 联系页 FAQ ===== */
function initFaq() {
  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var a = q.nextElementSibling;
      if (a) a.style.display = a.style.display === 'none' ? 'block' : 'none';
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initChat();
  initInterp();
  initFaq();
});
/* 在 initInterp 中补充雷达波形生成 */
function genTraces() {
  var g = document.getElementById('traces');
  if (!g) return;
  g.innerHTML = '';
  var colors = ['#2d7dd2', '#00b4d8', '#48b884', '#e88d30'];
  for (var t = 0; t < 37; t++) {
    var cx = 15 + t * 14.5;
    var d = 'M' + cx + ',200 ';
    for (var y = 0; y < 200; y += 3) {
      var amp = Math.sin(y * 0.08 + t * 0.3) * 4
        + Math.sin(y * 0.15 + t * 0.7) * 2
        + (y > 50 && y < 80 ? Math.sin(y * 0.12 + t * 0.5) * 6 : 0)
        + (y > 110 && y < 145 ? Math.sin(y * 0.1 + t * 0.2) * 5 : 0)
        + Math.random() * 1.5;
      d += 'L' + (cx + amp * (y > 180 ? 0.5 : 1)) + ',' + y + ' ';
    }
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d);
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', colors[t % colors.length]);
    p.setAttribute('stroke-width', '0.8');
    p.setAttribute('opacity', '0.6');
    g.appendChild(p);
  }
}
/* 在 DOMContentLoaded 中调用波形生成 */
document.addEventListener('DOMContentLoaded', function () {
  genTraces();
});
