# 仪器式深色界面（Codex Skill）

一套可迁移的中文数据界面设计语言：深色编辑式版式、青绿强调、1px 发丝线、等宽读数、星轨与星云材质层、来源与证据状态。

用于给任意数据密集产品搭前端（监控台、分析工具、台账、检索页），不是复制某个现成页面。

## 安装

```bash
git clone https://github.com/HY-Kai741/zhihang-compass-ui.git "$HOME/.codex/skills/zhihang-compass-ui"
```

或把整个目录复制到 `$CODEX_HOME/skills/` 下。调用方式：`$zhihang-compass-ui`。

## 结构

- `SKILL.md`：定位、迁移四问、工作流、验收清单
- `references/`：令牌、版式、组件、材质层、迁移映射、文案与数据诚实
- `assets/`：`tokens.css`、`effects.css`、`background.js`、`starter.html` 示例页

## 预览

直接打开 `assets/starter.html`（示例为虚构的「设备遥测台」）。

## 第三方资源

- IBM Plex Sans / Mono：SIL Open Font License 1.1，许可证见 `assets/fonts/`
- 夜面地球贴图：Solar System Scope，CC BY 4.0，见 `assets/CREDITS-earth.md`

公开发布或商用衍生作品时，需保留上述署名。
