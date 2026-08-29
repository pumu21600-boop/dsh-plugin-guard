/**
 * dsh-plugin-guard — 插件创作公约（Plugin Authoring Conventions）。
 *
 * 一个极简宿主插件：安装即通过 `ctx.sysprompt.section` 向每个会话的系统提示词
 * 注入「dsh 插件创作公约」，让运行在 DSH 上的所有 AI 在制作/修改插件时自动
 * 遵循这些规则——不需要手动复制、不需要设置页、不需要检查器。
 *
 * 公约正文与仓库根目录的 CONVENTIONS.md 保持同源（防止漂移时以本文件为准，
 * 它才是真正进入模型提示词的文本）。
 *
 * English code comments; the convention text itself is Chinese-primary with
 * English notes, because it is model-facing copy for zh-first users.
 */

/** Cordis plugin name. */
export const name = 'dsh-plugin-guard'

/** 需要的基础服务（仅 systemPrompt）。 */
export const inject = ['systemPrompt']

/**
 * 全局约定的 section 名称。独一无二避免与其它插件冲突。
 */
export const CONVENTIONS_SECTION_NAME = 'plugin-authoring-conventions'

/**
 * section 顺序：放在靠后的位置（persona/系统正文之后），避免干扰正常的
 * 系统提示词组装；空 section 会被自动丢弃，文本始终非空。
 */
const SECTION_ORDER = 400

/** 注入模型提示词的完整公约文本（与 CONVENTIONS.md 同源）。 */
const CONVENTIONS_TEXT = `# dsh 插件创作公约（你必须遵守）

以下规则约束你在本会话中创建或修改任何 dsh 插件（包括临时插件、仓库外插件、预设）时的行为。逐条遵守，不要违背。

## 一、样式三原则
1. 插件自身的组件样式：写自有前缀的普通类名（如 .pg_*），禁止使用 CSS Modules。
2. 样式化 DSH 界面内部元素：只用稳定选择器，优先级 [data-*] 属性 > id > role/aria > 主题 CSS 变量（--dsw-*）。
3. 绝对禁止写哈希类名（形如 ._8lIALq_userRow）：它按构建机器路径生成，本地重建必然失效；官方技能同样禁止 hard-coded product DOM selectors。

## 二、必须项
1. package.json：name 匹配 /^[a-z][a-z0-9-]{0,63}$/；exports 包含 "." 与 "./client"（有客户端时）。
2. dsh.client manifest：platform 固定 "web"；inject 只列真实用到的 @deepseek-ai 包。
3. 客户端半区：设置页必须用 ctx.slots.inject('settings.section', ...) 注册；文案用 ctx.locale.register 注册双语词典；样式用 <style data-plugin="插件id"> 注入（普通类名）。
4. lib/client.js 必须形如 window.__ModuleLoader__.load({id: <cordis 行 id>, factory: require => {...}})，id 与 cordis 行 id 一致。
5. 构建：用 esbuild；本机重建前设置 DSH_CSS_HASH_ROOT=/home/runner/work/deepseek-harness/deepseek-harness，保证与官方包类名一致。

## 三、红线（踩了必坏）
1. 不要 session.append 本构建未知的事件类型：会毒化会话日志、破坏其它构建的重放；要么加 ignorable:true，要么改用标准事件。
2. 持久化不要用 localStorage/IndexedDB：绑定 origin，换端口/主机即丢；用 ctx.settings.register / settingsScope 或存储域服务。
3. 不要直接改 document.body / window 的全局样式、不要挂 body 上的 position:fixed 覆盖层：与应用外壳冲突。

## 四、挂载与更新
1. 包放在 ~/.dsh/profiles/web/node_modules/（junction 指向源码目录）。
2. 在 ~/.dsh/profiles/web/cordis.patch.yml 追加：
   - id: <插件名>
     name: '<插件名>'
3. 修改 lib/client.js 后：重启后端 + 刷新页面（rev 查询会变）。

## 五、自查
- 写完后用你可用的一切检查（读源码、读文档、运行构建）确认没有违反上述规则；违反时先修正再交付。`

/**
 * Cordis apply：注册全局系统提示词段落。
 * 段落注册随插件 fiber 生命周期自动清理（重载/卸载即移除）。
 * @param ctx - 宿主根上下文。
 */
export function apply(ctx) {
  ctx.systemPrompt.section({
    name: CONVENTIONS_SECTION_NAME,
    order: SECTION_ORDER,
    text: CONVENTIONS_TEXT,
  })
}