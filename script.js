const state = {
  activeTool: 'score',
  lastOutput: ''
}

const toolMeta = {
  score: {
    title: '简历评分',
    resultTitle: '简历体检报告',
    mainLabel: '简历内容',
    showJd: false
  },
  match: {
    title: '岗位匹配',
    resultTitle: '岗位匹配报告',
    mainLabel: '简历内容',
    showJd: true
  },
  summary: {
    title: '自我评价',
    resultTitle: '自我评价草稿',
    mainLabel: '经历和优势',
    showJd: false
  },
  project: {
    title: '项目经历',
    resultTitle: '项目经历优化',
    mainLabel: '原始项目描述',
    showJd: true
  },
  interview: {
    title: '面试题',
    resultTitle: '面试准备清单',
    mainLabel: '简历亮点 / 项目经历',
    showJd: true
  }
}

const skillDict = {
  技术: [
    'JavaScript', 'TypeScript', 'Vue', 'React', 'Node', 'Webpack', 'Vite', 'Java', 'Spring',
    'MySQL', 'Redis', 'Python', 'Django', 'Flask', 'Linux', 'Docker', 'Kubernetes', 'Git',
    '小程序', '云开发', '算法', '数据结构', '接口', '性能优化'
  ],
  产品: [
    '需求分析', '用户调研', '竞品分析', '原型', 'Axure', 'Figma', 'PRD', '数据分析',
    '增长', '转化率', '留存', 'A/B测试', '项目管理', '用户体验', '商业化'
  ],
  运营: [
    '内容运营', '用户运营', '活动策划', '社群', '私域', '增长', '转化', '留存',
    '数据复盘', '投放', '公众号', '短视频', '直播', '裂变', 'SOP'
  ],
  通用: [
    '沟通', '协作', '执行力', '复盘', '学习能力', '责任心', '抗压', '跨部门',
    '推进', '落地', '优化', '指标', '结果'
  ]
}

const sampleResume = `姓名：张同学
目标岗位：前端开发工程师
教育经历：某某大学 计算机科学与技术 本科
技能：JavaScript、Vue、微信小程序、Node.js、MySQL、Git，了解前端性能优化。
项目经历：
1. 校园二手交易小程序：负责首页、发布商品、订单管理模块，使用微信小程序原生框架和云开发完成商品发布、图片上传和订单状态管理。
2. 后台数据看板：使用 Vue 和 ECharts 搭建数据可视化页面，展示用户增长、订单转化和活动效果。
实习经历：在互联网公司参与运营后台迭代，独立完成 6 个页面开发，优化列表渲染后首屏加载时间降低约 28%。
证书：大学英语四级。`

const sampleJd = `岗位职责：
1. 负责 Web / 小程序前端功能开发，参与产品需求评审和技术方案设计。
2. 使用 Vue 或 React 完成业务页面，保证页面性能和交互体验。
3. 与后端协作完成接口联调，处理线上问题。
任职要求：
1. 熟悉 JavaScript、HTML、CSS，了解 TypeScript 更佳。
2. 有小程序、Vue、数据可视化或性能优化经验。
3. 具备良好的沟通能力、学习能力和项目推进能力。`

const $ = (selector) => document.querySelector(selector)
const $$ = (selector) => Array.from(document.querySelectorAll(selector))

const roleInput = $('#roleInput')
const yearsInput = $('#yearsInput')
const resumeInput = $('#resumeInput')
const jdInput = $('#jdInput')
const resultContent = $('#resultContent')
const scoreValue = $('#scoreValue')
const scoreRing = $('#scoreRing')
const scoreLabel = $('#scoreLabel')
const scoreNote = $('#scoreNote')
const downloadBtn = $('#downloadBtn')

function normalizeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim()
}

function splitLines(text) {
  return String(text || '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function includesAny(text, words) {
  const source = text.toLowerCase()
  return words.some((word) => source.includes(String(word).toLowerCase()))
}

function extractKeywords(text) {
  const normalized = normalizeText(text)
  const hits = []
  Object.keys(skillDict).forEach((group) => {
    skillDict[group].forEach((word) => {
      if (normalized.toLowerCase().includes(word.toLowerCase()) && !hits.includes(word)) {
        hits.push(word)
      }
    })
  })
  return hits
}

function extractNumbers(text) {
  const matches = String(text || '').match(/\d+(\.\d+)?%?|\d+(\.\d+)?万?/g)
  return matches ? matches.slice(0, 12) : []
}

function scoreResume(text) {
  const raw = String(text || '')
  const normalized = normalizeText(raw)
  const lines = splitLines(raw)
  const keywords = extractKeywords(raw)
  const numbers = extractNumbers(raw)
  let score = 35
  const advantages = []
  const issues = []
  const suggestions = []

  if (normalized.length >= 450) {
    score += 12
    advantages.push('简历信息量较完整，具备进一步精修的基础。')
  } else {
    issues.push('简历内容偏少，建议补充实习、项目、职责和结果。')
    suggestions.push('每段经历至少写清背景、动作、工具、结果四类信息。')
  }

  if (includesAny(raw, ['教育', '本科', '硕士', '大学', '学院'])) {
    score += 8
    advantages.push('包含教育经历，基础信息较清楚。')
  } else {
    issues.push('缺少教育经历或学历信息。')
  }

  if (includesAny(raw, ['项目', '负责', '参与', '开发', '搭建', '优化'])) {
    score += 12
    advantages.push('包含项目或工作动作，能体现实际经历。')
  } else {
    issues.push('项目经历不明显，招聘方难以判断实际能力。')
  }

  if (keywords.length >= 8) {
    score += 12
    advantages.push('技能关键词较丰富，有利于岗位筛选。')
  } else if (keywords.length >= 4) {
    score += 8
  } else {
    issues.push('技能关键词较少，建议补充岗位相关工具、方法和业务词。')
  }

  if (numbers.length >= 3) {
    score += 11
    advantages.push('已有量化结果，能提升可信度。')
  } else {
    issues.push('量化结果不足，建议加入效率、转化、规模、成本、增长等数据。')
    suggestions.push('把“负责页面开发”改成“独立完成 6 个页面，首屏加载时间降低 28%”。')
  }

  if (lines.length >= 8) {
    score += 5
  } else {
    suggestions.push('用分段和项目符号组织内容，避免大段文字堆叠。')
  }

  if (includesAny(raw, ['结果', '提升', '降低', '增长', '完成', '上线', '转化'])) {
    score += 8
  } else {
    issues.push('经历描述偏职责罗列，结果导向不够。')
  }

  score = Math.max(0, Math.min(96, score))

  if (!suggestions.length) {
    suggestions.push('继续针对目标岗位补充高频关键词，并把最强项目放在简历前半部分。')
    suggestions.push('每个项目保留 2 到 4 条高质量要点，避免堆砌细节。')
  }

  return {
    score,
    keywords,
    numbers,
    advantages,
    issues,
    suggestions
  }
}

function analyzeMatch(resume, jd) {
  const resumeKeywords = extractKeywords(resume)
  const jdKeywords = extractKeywords(jd)
  const matched = jdKeywords.filter((word) => resumeKeywords.includes(word))
  const missing = jdKeywords.filter((word) => !resumeKeywords.includes(word))
  const ratio = jdKeywords.length ? Math.round((matched.length / jdKeywords.length) * 100) : 0
  const base = scoreResume(resume).score
  const score = Math.round(base * 0.45 + ratio * 0.55)

  const suggestions = missing.slice(0, 8).map((word) => {
    return `如果你确实具备“${word}”经验，建议在技能或项目经历中补充具体使用场景。`
  })

  if (!suggestions.length) {
    suggestions.push('当前 JD 关键词覆盖较好，建议重点强化项目结果和岗位相关排序。')
  }

  return {
    score: Math.max(0, Math.min(98, score)),
    matched,
    missing,
    suggestions
  }
}

function buildSummary(role, years, text) {
  const keywords = extractKeywords(text).slice(0, 8)
  const nums = extractNumbers(text).slice(0, 4)
  const roleName = role || '目标岗位'
  const skillText = keywords.length ? keywords.join('、') : '岗位相关技能'
  const resultText = nums.length ? `曾在项目中沉淀 ${nums.join('、')} 等可量化成果，` : ''

  return `本人面向${roleName}方向，具备${years}相关学习或实践经验，熟悉${skillText}。${resultText}能够围绕业务目标拆解任务，推进需求落地，并在执行过程中持续复盘优化。希望在后续工作中结合岗位场景提升专业深度，为团队交付稳定、可衡量的结果。`
}

function optimizeProject(role, projectText, jd) {
  const keywords = extractKeywords(projectText + '\n' + jd).slice(0, 8)
  const nums = extractNumbers(projectText)
  const roleName = role || '目标岗位'
  const keywordText = keywords.length ? keywords.join('、') : '岗位相关工具和方法'
  const resultText = nums.length ? `最终形成 ${nums.join('、')} 等结果。` : '建议补充上线规模、效率提升、转化提升或成本降低等量化结果。'

  return [
    `项目名称：根据真实项目名称填写，建议突出与${roleName}相关的业务场景。`,
    `项目背景：围绕用户需求或业务问题展开，说明为什么要做这个项目。`,
    `个人职责：负责需求拆解、方案设计、核心模块实现和问题跟进，重点体现个人贡献而非团队泛描述。`,
    `技术/方法：使用 ${keywordText} 完成核心工作，并说明选择这些方案的原因。`,
    `项目难点：描述一个具体难点，例如性能、协作、数据准确性、转化率或稳定性问题。`,
    `项目结果：${resultText}`
  ].join('\n')
}

function generateInterviewQuestions(role, resume, jd) {
  const roleName = role || '目标岗位'
  const keywords = extractKeywords(resume + '\n' + jd).slice(0, 10)
  const questions = [
    `请用 2 分钟介绍一下你自己，并说明为什么适合${roleName}。`,
    '简历中最能体现你能力的项目是哪一个？你的个人贡献是什么？',
    '你遇到过最难推进的问题是什么？最后如何解决？',
    '如果重新做一次这个项目，你会优先优化什么？',
    '你如何衡量一个项目是否成功？请结合具体指标说明。'
  ]

  keywords.slice(0, 6).forEach((word) => {
    questions.push(`你在项目中如何使用或理解“${word}”？请结合具体场景说明。`)
  })

  questions.push('你对这个岗位未来 3 个月的学习和产出计划是什么？')
  questions.push('你有什么想了解团队、业务或岗位目标的问题？')

  return questions
}

function renderSections(sections) {
  resultContent.innerHTML = sections.map((section) => {
    if (section.type === 'keywords') {
      return `<section class="result-section"><h3>${section.title}</h3><div class="keyword-list">${section.items.map((item) => `<span class="keyword ${section.missing ? 'missing' : ''}">${escapeHtml(item)}</span>`).join('')}</div></section>`
    }

    if (section.type === 'text') {
      return `<section class="result-section"><h3>${section.title}</h3><p class="generated-text">${escapeHtml(section.text)}</p></section>`
    }

    return `<section class="result-section"><h3>${section.title}</h3><ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>`
  }).join('')
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function updateScore(score, label, note) {
  scoreValue.textContent = Number.isFinite(score) ? score : '--'
  scoreRing.style.setProperty('--score', Number.isFinite(score) ? score : 0)
  scoreLabel.textContent = label
  scoreNote.textContent = note
}

function collectOutputText(title, sections) {
  return [
    title,
    '',
    ...sections.flatMap((section) => {
      if (section.type === 'text') return [section.title, section.text, '']
      return [section.title, ...section.items.map((item) => `- ${item}`), '']
    })
  ].join('\n')
}

function runTool() {
  const role = roleInput.value.trim()
  const years = yearsInput.value
  const resume = resumeInput.value.trim()
  const jd = jdInput.value.trim()

  if (!resume && state.activeTool !== 'interview') {
    showEmpty('请先输入内容', '当前工具需要简历、经历或项目描述作为输入。')
    return
  }

  if (['match', 'project', 'interview'].includes(state.activeTool) && !jd) {
    showEmpty('请补充岗位 JD', '岗位匹配、项目优化和面试题生成需要招聘要求作为参考。')
    return
  }

  if (state.activeTool === 'score') {
    const report = scoreResume(resume)
    const sections = [
      { title: '优势分析', items: report.advantages.length ? report.advantages : ['已有基础信息，可继续补充项目成果。'] },
      { title: '问题分析', items: report.issues.length ? report.issues : ['暂无明显结构问题，建议继续针对岗位细化。'] },
      { title: '优化建议', items: report.suggestions },
      { title: '识别到的关键词', type: 'keywords', items: report.keywords.length ? report.keywords : ['暂无明显关键词'] }
    ]
    updateScore(report.score, report.score >= 80 ? '竞争力较强' : report.score >= 65 ? '具备优化空间' : '需要重点补强', '综合评估简历完整度、关键词、项目结果和量化表达。')
    renderSections(sections)
    saveOutput('简历体检报告', sections)
    return
  }

  if (state.activeTool === 'match') {
    const report = analyzeMatch(resume, jd)
    const sections = [
      { title: '已匹配关键词', type: 'keywords', items: report.matched.length ? report.matched : ['暂无明显匹配'] },
      { title: '缺失关键词', type: 'keywords', missing: true, items: report.missing.length ? report.missing : ['暂无明显缺失'] },
      { title: '补强建议', items: report.suggestions }
    ]
    updateScore(report.score, report.score >= 80 ? '高度匹配' : report.score >= 60 ? '中等匹配' : '匹配不足', '根据 JD 关键词覆盖度和简历基础质量估算。')
    renderSections(sections)
    saveOutput('岗位匹配报告', sections)
    return
  }

  if (state.activeTool === 'summary') {
    const text = buildSummary(role, years, resume)
    const sections = [
      { title: '优化后的自我评价', type: 'text', text },
      { title: '使用建议', items: ['控制在 80 到 140 字，放在简历顶部。', '投递不同岗位时替换目标岗位和关键技能。', '避免“吃苦耐劳、性格开朗”等空泛表述。'] }
    ]
    updateScore(88, '可直接改写使用', '已按岗位、年限、技能和结果导向生成。')
    renderSections(sections)
    saveOutput('自我评价草稿', sections)
    return
  }

  if (state.activeTool === 'project') {
    const text = optimizeProject(role, resume, jd)
    const sections = [
      { title: '优化后的项目经历', type: 'text', text },
      { title: '改写原则', items: ['先写业务问题，再写个人动作。', '保留和目标岗位最相关的技术、方法或指标。', '每条项目经历尽量带一个可验证结果。'] }
    ]
    updateScore(86, '结构更清晰', '已按背景、职责、方法、难点、结果重新组织。')
    renderSections(sections)
    saveOutput('项目经历优化', sections)
    return
  }

  if (state.activeTool === 'interview') {
    const questions = generateInterviewQuestions(role, resume, jd)
    const sections = [
      { title: '高频面试题', items: questions },
      { title: '准备建议', items: ['每个问题准备 60 秒和 180 秒两个版本。', '项目类问题使用“背景-行动-结果-复盘”结构回答。', '准备 2 个反问问题，聚焦岗位目标和团队协作方式。'] }
    ]
    updateScore(90, '面试清单已生成', '问题覆盖自我介绍、项目深挖、岗位技能和反问环节。')
    renderSections(sections)
    saveOutput('面试准备清单', sections)
  }
}

function saveOutput(title, sections) {
  state.lastOutput = collectOutputText(title, sections)
  downloadBtn.disabled = false
}

function showEmpty(title, note) {
  updateScore(null, title, note)
  resultContent.innerHTML = `<div class="empty-state"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(note)}</p></div>`
  state.lastOutput = ''
  downloadBtn.disabled = true
}

function switchTool(tool) {
  state.activeTool = tool
  const meta = toolMeta[tool]
  $('#toolTitle').textContent = meta.title
  $('#resultTitle').textContent = meta.resultTitle
  $('#mainInputLabel').textContent = meta.mainLabel
  $('#jdField').classList.toggle('hidden', !meta.showJd)
  $$('.tab').forEach((tab) => {
    const active = tab.dataset.tool === tool
    tab.classList.toggle('active', active)
    tab.setAttribute('aria-selected', String(active))
  })
  showEmpty('还没有结果', '输入内容后点击生成结果。')
}

function downloadOutput() {
  if (!state.lastOutput) return
  const blob = new Blob([state.lastOutput], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = '求职工具结果.txt'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function clearInputs() {
  resumeInput.value = ''
  jdInput.value = ''
  roleInput.value = ''
  showEmpty('还没有结果', '选择工具后输入内容，点击生成结果即可查看建议。')
}

function loadSample() {
  roleInput.value = '前端开发工程师'
  yearsInput.value = '应届生'
  resumeInput.value = sampleResume
  jdInput.value = sampleJd
  if (state.activeTool === 'score') {
    runTool()
  }
}

$$('.tab').forEach((tab) => {
  tab.addEventListener('click', () => switchTool(tab.dataset.tool))
})

$$('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    roleInput.value = chip.dataset.role
  })
})

$('#runBtn').addEventListener('click', runTool)
$('#clearBtn').addEventListener('click', clearInputs)
$('#downloadBtn').addEventListener('click', downloadOutput)
$('#loadSampleBtn').addEventListener('click', loadSample)

switchTool('score')
