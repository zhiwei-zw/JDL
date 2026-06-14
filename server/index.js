import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const distRoot = path.join(projectRoot, "dist");
const staticRoot = existsSync(path.join(distRoot, "index.html")) ? distRoot : projectRoot;
const dataDir = path.join(__dirname, "data");
const historyFile = path.join(dataDir, "history.json");
const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "0.0.0.0";

const toolLabels = {
  score: "简历评分",
  match: "岗位匹配",
  self: "自我评价",
  project: "项目经历",
  interview: "面试题",
};

const fallbackProject = `校园二手交易平台
背景：校内闲置物品交易效率低，信息分散。
职责：负责前端页面、商品发布、筛选搜索和订单状态。
动作：使用 React 拆分可复用组件，优化图片上传和列表加载。
结果：发布流程从 5 分钟缩短到 2 分钟，首屏加载速度提升 35%。`;

function inferKeywords(target, jd = "") {
  const text = `${target} ${jd}`.toLowerCase();
  const groups = [
    {
      when: ["前端", "react", "vue", "javascript", "web"],
      words: ["JavaScript", "React", "Vue.js", "TypeScript", "Node.js", "前端开发", "组件化", "性能优化", "Webpack", "自动化测试", "CI/CD"],
    },
    {
      when: ["运营", "增长", "用户", "活动", "内容"],
      words: ["用户增长", "活动运营", "数据分析", "转化率", "留存", "复盘", "渠道", "内容运营", "社群运营", "A/B 测试"],
    },
    {
      when: ["产品", "经理", "需求", "商业"],
      words: ["需求分析", "用户调研", "产品规划", "原型设计", "数据分析", "项目推进", "竞品分析", "指标拆解", "跨部门协作"],
    },
    {
      when: ["后端", "java", "服务端", "node"],
      words: ["Java", "Spring Boot", "Node.js", "数据库", "接口设计", "缓存", "性能优化", "微服务", "单元测试"],
    },
  ];
  const found = groups.find((group) => group.when.some((item) => text.includes(item)));
  return found?.words || ["项目经历", "数据结果", "团队协作", "问题分析", "业务理解", "执行落地", "沟通协调", "复盘优化"];
}

function hasAny(text, words) {
  return words.some((word) => text.includes(word));
}

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeForm(input = {}) {
  return {
    target: String(input.target || "").slice(0, 120),
    years: String(input.years || "").slice(0, 40),
    resume: String(input.resume || "").slice(0, 20000),
    jd: String(input.jd || "").slice(0, 12000),
    project: String(input.project || "").slice(0, 8000),
    selfTone: String(input.selfTone || "").slice(0, 40),
  };
}

function analyze(form) {
  const resume = form.resume.trim();
  const jd = form.jd.trim();
  const target = form.target.trim() || "目标岗位";
  const lower = resume.toLowerCase();
  const keywords = inferKeywords(target, jd);
  const matched = keywords.filter((word) => lower.includes(word.toLowerCase()));
  const partial = keywords.filter((word) => !matched.includes(word)).slice(0, 4);
  const missing = keywords.filter((word) => !matched.includes(word)).slice(4);

  const lengthScore = clamp(Math.round(resume.length / 45), 0, 20);
  const sections = [
    ["教育经历", "教育", "学校", "本科", "硕士"],
    ["工作经历", "实习", "公司", "负责"],
    ["项目经历", "项目", "平台", "系统"],
    ["技能", "技能", "JavaScript", "React", "运营"],
    ["结果", "提升", "降低", "增长", "%", "万", "数据"],
  ].filter(([, ...words]) => hasAny(resume, words)).length;
  const sectionScore = sections * 8;
  const numberScore = clamp(countMatches(resume, /(\d+%|\d+\s?万|\d+\s?人|\d+\s?天|\d+\s?周|\d+\s?个|\d+\.\d+)/g) * 5, 0, 20);
  const keywordScore = clamp(Math.round((matched.length / keywords.length) * 25), 0, 25);
  const actionScore = hasAny(resume, ["负责", "优化", "搭建", "推进", "分析", "设计", "上线", "复盘"]) ? 10 : 2;
  const score = clamp(35 + lengthScore + sectionScore + numberScore + keywordScore + actionScore, 45, 96);

  const issues = [];
  if (resume.length < 260) {
    issues.push({ title: "简历内容偏短", detail: "建议补充教育、工作、项目、技能和结果数据，避免只有职责描述。", level: "高", tone: "danger" });
  }
  if (numberScore < 10) {
    issues.push({ title: "项目成果不够量化", detail: "用具体数字说明规模、效率、转化、留存、成本或上线结果。", level: "高", tone: "danger" });
  }
  if (keywordScore < 15) {
    issues.push({ title: "岗位关键词匹配不足", detail: `当前与「${target}」的关键词贴合度不够，建议补充核心技能和业务词。`, level: "中", tone: "warn" });
  }
  if (!hasAny(resume, ["项目", "平台", "系统", "活动", "增长"])) {
    issues.push({ title: "项目经历不够突出", detail: "至少写清一个项目的背景、动作、难点和结果。", level: "中", tone: "warn" });
  }
  if (!hasAny(resume, ["优化", "提升", "降低", "增长", "复盘"])) {
    issues.push({ title: "表达偏职责清单", detail: "建议把「做了什么」升级为「解决什么问题，带来什么结果」。", level: "低", tone: "success" });
  }

  const actions = [
    missing[0] ? `补充岗位关键词「${missing[0]}」，并写明使用场景。` : "把已匹配关键词放到项目结果附近，增强可信度。",
    "把项目经历改成「背景 - 动作 - 结果」结构，每段保留 2-3 个要点。",
    "为每个核心项目增加至少 1 个数字结果，例如效率、转化率、用户量或上线周期。",
    `围绕「${target}」重写自我评价，避免空泛形容词。`,
  ];

  return {
    score,
    level: score >= 86 ? "优秀" : score >= 75 ? "良好" : score >= 62 ? "可优化" : "需要补强",
    percentile: clamp(score - 8, 42, 92),
    matchRate: Math.round((matched.length / keywords.length) * 100),
    keywords: [
      ...matched.map((label) => ({ label, type: "matched" })),
      ...partial.map((label) => ({ label, type: "partial" })),
      ...missing.map((label) => ({ label, type: "missing" })),
    ],
    issues: issues.slice(0, 5),
    actions,
    matched,
    missing,
  };
}

function makeSelfEvaluation(form, result) {
  const target = form.target || "目标岗位";
  const strengths = result.matched.slice(0, 3).join("、") || "项目执行、学习能力、团队协作";
  return [
    `版本 A｜专业简洁：我具备${target}相关的项目实践经验，熟悉${strengths}等能力，能够围绕业务目标完成需求拆解、方案落地和结果复盘。过往项目中，我注重用数据衡量效果，并能与产品、设计、后端或运营角色高效协作，持续提升交付质量。`,
    `版本 B｜结果导向：我关注从问题到结果的完整闭环，能够结合${target}岗位要求，将项目目标拆解为可执行动作，并通过数据验证优化效果。我的优势在于学习速度快、执行稳定，能把复杂任务拆成清晰步骤，推动项目按时落地。`,
    `版本 C｜应届/转行友好：虽然我仍在持续积累更完整的职场经验，但我已经通过项目训练建立了较好的实践基础，尤其在${strengths}方面有明确积累。我愿意快速学习业务，并用扎实执行和复盘意识补齐经验差距。`,
  ];
}

function makeProjectBullets(form) {
  const source = form.project.trim() || fallbackProject;
  const lines = source.split(/\n+/).filter(Boolean);
  const title = lines[0]?.slice(0, 32) || "项目经历优化";
  return [
    `${title}`,
    "背景：梳理业务痛点和目标用户，明确项目要解决的核心问题。",
    "职责：负责需求拆解、方案设计、核心功能落地和跨角色协作推进。",
    "动作：围绕关键流程进行模块化拆分，优化交互路径和数据反馈机制。",
    "结果：建议补充可量化结果，例如效率提升、转化增长、用户规模、成本下降或上线周期。",
  ];
}

function makeInterviewQuestions(form, result) {
  const target = form.target || "目标岗位";
  const missing = result.missing.slice(0, 3);
  return [
    { q: `请用 2 分钟介绍你为什么适合${target}？`, a: "按「岗位理解 - 相关经历 - 结果证明 - 入职后贡献」组织回答。" },
    { q: "你简历里最有代表性的项目是什么？难点在哪里？", a: "讲清背景、你的职责、关键决策、遇到的难点和量化结果。" },
    { q: "如果项目结果不理想，你会怎么复盘？", a: "从目标、数据、过程、协作和下一步实验方案拆解。" },
    { q: missing[0] ? `你对「${missing[0]}」的理解和实践是什么？` : "你如何持续提升自己的岗位能力？", a: "结合具体场景回答，不要只讲概念。" },
    { q: "你希望下一份工作获得什么成长？", a: "把个人成长和岗位价值连接起来，避免只谈个人诉求。" },
  ];
}

function buildReport(toolId, form) {
  const report = {
    ...analyze(form),
    generatedAt: new Date().toLocaleString("zh-CN", { hour12: false }),
    toolId,
    handledBy: "server",
  };
  if (toolId === "self") report.selfEvaluations = makeSelfEvaluation(form, report);
  if (toolId === "project") report.projectBullets = makeProjectBullets(form);
  if (toolId === "interview") report.questions = makeInterviewQuestions(form, report);
  if (toolId === "match" && !form.jd.trim()) {
    report.issues = [
      { title: "缺少岗位 JD", detail: "建议粘贴目标岗位 JD，匹配结果会更准确。", level: "中", tone: "warn" },
      ...report.issues,
    ].slice(0, 5);
  }
  return report;
}

function getSessionId(req) {
  const raw = String(req.headers["x-jdl-session"] || "anonymous");
  return raw.replace(/[^\w.-]/g, "").slice(0, 80) || "anonymous";
}

async function readHistory() {
  try {
    const raw = await readFile(historyFile, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeHistory(items) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(historyFile, JSON.stringify(items.slice(0, 500), null, 2), "utf8");
}

function publicHistory(items, sessionId) {
  return items
    .filter((item) => item.sessionId === sessionId)
    .map(({ sessionId: _sessionId, ...item }) => item)
    .slice(0, 50);
}

async function addHistory(sessionId, form, toolId, report) {
  const history = await readHistory();
  const entry = {
    id: crypto.randomUUID(),
    sessionId,
    toolId,
    tool: toolLabels[toolId] || "工具",
    target: form.target || "未填写岗位",
    score: report.score,
    time: report.generatedAt,
  };
  const own = [entry, ...history.filter((item) => item.sessionId === sessionId)].slice(0, 50);
  const others = history.filter((item) => item.sessionId !== sessionId);
  const next = [...own, ...others].slice(0, 500);
  await writeHistory(next);
  return publicHistory(next, sessionId);
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-JDL-Session",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_200_000) {
        reject(new Error("请求内容过大"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("JSON 格式不正确"));
      }
    });
    req.on("error", reject);
  });
}

async function handleApi(req, res, pathname) {
  if (!pathname.startsWith("/api")) return false;
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return true;
  }

  const route = pathname.slice(4) || "/";
  const sessionId = getSessionId(req);

  try {
    if (route === "/health" && req.method === "GET") {
      sendJson(res, 200, {
        ok: true,
        service: "jdl-resume-assistant",
        mode: "node-backend",
        staticRoot,
      });
      return true;
    }

    if (route === "/history" && req.method === "GET") {
      const history = await readHistory();
      sendJson(res, 200, { history: publicHistory(history, sessionId) });
      return true;
    }

    if (route === "/history" && req.method === "DELETE") {
      const history = await readHistory();
      const next = history.filter((item) => item.sessionId !== sessionId);
      await writeHistory(next);
      sendJson(res, 200, { ok: true, history: [] });
      return true;
    }

    if (route === "/analyze" && req.method === "POST") {
      const body = await readBody(req);
      const toolId = String(body.toolId || "score");
      if (!toolLabels[toolId]) {
        sendJson(res, 400, { error: "未知工具类型" });
        return true;
      }
      const form = normalizeForm(body.form);
      if (!form.resume.trim()) {
        sendJson(res, 400, { error: "请先填写简历内容" });
        return true;
      }
      const report = buildReport(toolId, form);
      const history = await addHistory(sessionId, form, toolId, report);
      sendJson(res, 200, { report, history });
      return true;
    }

    sendJson(res, 404, { error: "接口不存在" });
    return true;
  } catch (error) {
    sendJson(res, 500, { error: error.message || "服务端处理失败" });
    return true;
  }
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

async function serveStatic(req, res, pathname) {
  const cleanPath = decodeURIComponent(pathname);
  const requested = cleanPath === "/" ? "/index.html" : cleanPath;
  const target = path.normalize(path.join(staticRoot, requested));

  if (!target.startsWith(staticRoot)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const fileStat = await stat(target);
    if (!fileStat.isFile()) throw new Error("Not a file");
    const ext = path.extname(target).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(await readFile(target));
  } catch {
    const indexFile = path.join(staticRoot, "index.html");
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(await readFile(indexFile));
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);
  const handled = await handleApi(req, res, url.pathname);
  if (!handled) await serveStatic(req, res, url.pathname);
});

server.listen(port, host, () => {
  const localHost = host === "0.0.0.0" ? "127.0.0.1" : host;
  console.log(`求职简历助手后端已启动：http://${localHost}:${port}`);
});
