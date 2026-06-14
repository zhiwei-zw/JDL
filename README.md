# 求职简历助手

这是一个可直接使用的求职材料优化网站。前端会优先连接 Node 后端；如果后端不可用，页面会自动切换到浏览器本地模式，保证 GitHub Pages 上也能继续使用。

## 已可用功能

- 简历评分：根据完整度、岗位关键词、量化结果和表达结构生成诊断。
- 岗位匹配：粘贴岗位 JD 后输出匹配度、已匹配 / 待加强 / 缺失关键词。
- 自我评价：根据目标岗位和简历生成多版自我评价。
- 项目经历：把项目素材改写成背景、职责、动作、结果结构。
- 面试题：根据简历和岗位生成面试问题与答题方向。
- 模板库：支持载入模板、下载模板文本。
- 进度条：根据五个工具的完成状态自动更新。
- 最近记录：有后端时按浏览器会话保存到 SQLite 数据库；没有后端时保存到本地浏览器。
- 报告操作：支持复制报告、下载文本报告、清空输入、清空结果和清空记录。

## 暂不开放

付费能力先不做。页面里只保留后续能力计划，不会进入支付流程。

## 在线访问

GitHub Pages 静态版：

```text
https://zhiwei-zw.github.io/JDL/
```

静态版不能运行 Node 后端，所以会自动使用本地备用逻辑。

## 后端部署

这个仓库已经包含 Node 后端和 SQLite 数据库。请使用 Node 24 或更高版本：

```text
npm start
```

默认端口是 `8787`，也可以用环境变量指定：

```text
PORT=3000 npm start
```

后端会同时提供网页和接口。部署到支持 Node 的平台后，访问平台分配的网址即可使用完整后端版。

默认数据库文件是：

```text
server/data/jdl.sqlite
```

也可以用环境变量指定数据库路径：

```text
SQLITE_PATH=/data/jdl.sqlite npm start
```

## Docker 部署

仓库已包含 `Dockerfile`，可以直接构建容器：

```text
docker build -t jdl-resume-assistant .
docker run -p 8787:8787 -v jdl-data:/app/server/data jdl-resume-assistant
```

如果部署到云平台，建议挂载持久化磁盘到 `/app/server/data`，这样 SQLite 数据库不会在重新部署后丢失。

## API

- `GET /api/health`：服务健康检查。
- `POST /api/analyze`：生成简历评分、岗位匹配、自我评价、项目经历或面试题结果。
- `GET /api/history`：读取当前浏览器会话的生成历史。
- `DELETE /api/history`：清空当前浏览器会话的生成历史。

## 数据说明

当前没有登录系统。后端使用 SQLite 保存浏览器会话和生成历史摘要，例如工具名称、岗位、评分、生成时间和报告 JSON；简历正文不写入历史表。数据库文件保存在 `server/data/jdl.sqlite`，该文件已加入忽略规则，不会提交到仓库。
