# dsh-plugin-guard（插件创作公约）

面向 [DeepSeek Harness](https://github.com/deepseek-ai/DeepSeek-Harness)（dsh）
的**纯宿主**极简插件。

**只做一件事**：挂载后通过 `ctx.sysprompt.section` 注册一节全局系统提示词，
把「dsh 插件创作公约」注入**每一个 agent** 的系统提示词——普通会话、创造模式、
子代理都会在制作/修改插件时自动遵守。没有设置页、没有复制按钮、没有任何检查器。

## 注入的公约内容

1. 样式三原则（自有前缀普通类名；稳定选择器；禁止哈希类名）。
2. 必须项（`dsh.client` manifest、exports、loader 包装身份、esbuild 构建、`DSH_CSS_HASH_ROOT`）。
3. 红线（不写自定义会话事件；不用 localStorage 持久化；不改 body/window 全局样式）。
4. 挂载与更新流程（profile junction + patch 行 + 重启）。

权威文本在 `src/index.ts`（它才是真正进入模型提示词的文本）。
`CONVENTIONS.md` / `CONVENTIONS.en.md` / `SKILL.md` 是仓库可读版，编辑源码
文本时请同步。

## 目录结构

```
src/index.ts          宿主半区：sysprompt.section 注册（全部逻辑）
scripts/build.mjs     esbuild 宿主构建
CONVENTIONS.md        公约（中文）
CONVENTIONS.en.md     公约（英文）
SKILL.md              技能版公约（供 AI 直接引用）
lib/                  构建产物（已 gitignore）
```

## 安装

1. 链接到 profile：

   ```powershell
   New-Item -ItemType Junction -Path "$env:USERPROFILE\.dsh\profiles\web\node_modules\dsh-plugin-guard" -Target (Get-Location).Path
   ```

2. 在 `~/.dsh/profiles/web/cordis.patch.yml` 追加：

   ```yaml
   - id: dsh-plugin-guard
     name: 'dsh-plugin-guard'
   ```

3. 重启后端即生效：此后每个 agent 的系统提示词都携带公约（纯宿主、无客户端，
   也无需刷新页面）。

## 构建

```sh
node scripts/build.mjs
```

产出 `lib/index.js`（宿主、esm、外部化 `@deepseek-ai/*` 与 `node:*`）。

## 备注

- section 顺序 400：放在 persona 与核心段落之后，不干扰正常提示词组装。
- 段落随插件 fiber 生命周期注册/清理（卸载插件即自动移除）。
- License: MIT。