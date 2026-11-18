# 组件配方

所有片段基于 `assets/tokens.css` 的令牌。

## 按钮

```css
.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:9px;
  height:38px;padding:0 16px;border-radius:6px;
  font:600 13px/1 var(--sans);cursor:pointer;
  transition:background-position .5s cubic-bezier(.4,0,.2,1),
             border-color .18s ease,transform .18s ease,box-shadow .18s ease;
}
.btn-primary{
  color:#f1fffc;border:1px solid rgba(125,220,208,.4);
  background-color:#157a6f;
  background-image:linear-gradient(90deg,#17a78c 0%,#3ac8b4 30%,#6fd9cc 50%,#3ac8b4 70%,#17a78c 100%);
  background-size:300% 100%;background-position:0 0;background-repeat:no-repeat;
  box-shadow:var(--shadow-btn),inset 0 1px 0 rgba(255,255,255,.06);
}
.btn-primary:hover{background-position:100% 0;border-color:rgba(150,241,227,.56);transform:translateY(-1px)}
.btn-primary::after{content:"→";font-family:var(--mono);font-size:12px;color:#bff6ed;transition:transform .18s ease}
.btn-primary:hover::after{transform:translateX(2px)}
.btn-ghost{
  color:#fff;background:transparent;border:1px solid rgba(255,255,255,.22);
}
.btn-ghost:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.5)}
.btn-danger{color:#fff;background:#b42318;border:1px solid #b42318}
```

- 主按钮一屏只有一个。次操作降为幽灵按钮或文字动作。
- 危险按钮不与主按钮同排并列。
- 按钮文字动词开头，≤6 字。

## 玻璃面板

```css
.panel-glass{
  background:var(--bg-glass);
  border:1px solid rgba(129,190,194,.19);
  border-radius:10px;
  box-shadow:var(--shadow-float);
  backdrop-filter:blur(10px);
  overflow:hidden;
}
.panel-head{
  display:flex;align-items:baseline;justify-content:space-between;gap:12px;
  padding:17px 20px 15px;
  border-bottom:1px solid rgba(149,202,204,.14);
  background:rgba(255,255,255,.018);
}
.panel-head h2{font-size:15px;color:var(--ink-strong)}
```

- 同一屏最多两层玻璃。
- 页面主区（总览、详情、表单）不用玻璃。

## 台账行

```css
.row{
  display:grid;grid-template-columns:minmax(0,1fr) 112px 78px;
  gap:14px;align-items:center;
  padding:17px 20px;border-bottom:1px solid rgba(149,202,204,.12);
  transition:background .18s ease;
}
.row:hover{background:rgba(113,218,207,.035)}
.row.is-selected{
  margin-inline:-10px;padding-inline:30px;
  border-bottom-color:rgba(113,218,207,.22);
  border-radius:6px;
  background:linear-gradient(90deg,rgba(69,162,151,.12),rgba(69,162,151,.025));
}
.row.is-target{border-left:2px solid rgba(228,186,105,.62)}
```

- 悬停不位移，只换底色。
- 选中用青绿；目标用金色左边线，全页一处。
- 行内元信息 `12px`，`--ink-dim`；主标题 `14.5px`，`--ink-strong`。

## 读数单元

```css
.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid var(--line)}
.metric{padding:22px 18px 25px;border-right:1px solid var(--line);text-align:center}
.metric:last-child{border-right:0}
.metric-index{display:block;margin-bottom:17px;font:400 10px/1 var(--mono);letter-spacing:.1em;color:var(--blue)}
.metric-k{font-size:11.5px;color:var(--ink-muted)}
.metric-v{margin-top:5px;font:500 clamp(22px,2.2vw,31px)/1.2 var(--mono);color:var(--ink-strong);letter-spacing:-.035em}
.metric-s{margin-top:5px;font-size:11.5px;color:var(--ink-muted)}
```

## 状态标签

```css
.chip{
  display:inline-flex;align-items:center;gap:5px;
  padding:2px 9px;border-radius:999px;
  font:500 11px/1.6 var(--mono);letter-spacing:.04em;
  border:1px solid transparent;
}
.chip-ok{color:var(--ok);background:rgba(101,217,176,.1);border-color:rgba(101,217,176,.24)}
.chip-warn{color:var(--warn);background:rgba(228,186,105,.1);border-color:rgba(228,186,105,.24)}
.chip-danger{color:var(--danger);background:rgba(213,109,97,.1);border-color:rgba(213,109,97,.24)}
.chip-unknown{color:var(--ink-dim);background:rgba(255,255,255,.04);border-color:var(--line)}
```

颜色 + 文字同时出现。未知状态统一写「暂无记录」。

## 来源标注

```html
<span class="chip chip-warn">演示数据 · 非真实业务</span>
<span class="chip chip-unknown">无原始凭据</span>

<span class="chip" style="color:var(--blue);border-color:rgba(117,201,236,.24)">
  外部采集 · 网关 G-07 · 2026-11-14 03:12
</span>
```

- 模拟 / 人工录入用 `--warn`，外部采集用 `--blue`。
- 外部数据必须带来源名、采集时间、原始凭据入口，并提示「以原始来源为准」。
- 招聘、课程等具体场景按同一结构替换名词，不要改颜色语义。

## 空态与错误态

```html
<div class="state">
  <strong>还没有可用的成长计划</strong>
  <p>目标岗位未确定，无法计算技能差距。</p>
  <div class="actions"><button class="btn btn-primary">选择目标岗位</button></div>
</div>
```

```css
.state{
  padding:28px 0;border-top:1px solid var(--line);
  color:var(--ink-muted);text-align:left;
}
.state strong{display:block;margin-bottom:6px;font-size:14.5px;color:var(--ink-strong)}
.state p{margin:0 0 14px;max-width:620px;font-size:12.5px;line-height:1.65}
.state .actions{justify-content:flex-start}
```

- 不用居中插画，不用「哎呀」。
- 三行：发生了什么 → 为什么 → 下一步。

## 抽屉与弹窗

```css
.drawer{
  position:fixed;inset:0 0 0 auto;width:min(420px,100vw);
  background:var(--bg-panel);border-left:1px solid var(--line);
  box-shadow:-12px 0 34px rgba(0,0,0,.42);
  transform:translateX(100%);
  transition:transform .24s cubic-bezier(.2,.75,.25,1);
  z-index:60;
}
.drawer.is-open{transform:none}
.scrim{position:fixed;inset:0;background:rgba(4,7,10,.68);z-index:50}
```

- 打开时锁滚动，关闭后焦点回到触发元素。
- 弹窗只用于必须阻断的确认。

## 表单

```css
.field{display:grid;gap:6px}
.field label{font:500 10px/1.4 var(--mono);letter-spacing:.12em;color:var(--ink-dim)}
.field input,.field select,.field textarea{
  height:38px;padding:0 12px;
  background:#0b1117;border:1px solid #3b4852;border-radius:3px;
  color:var(--ink);font:400 13px/1.4 var(--sans);
}
.field input:focus{outline:none;border-color:#7aa9c5;box-shadow:0 0 0 3px rgba(88,148,182,.16)}
```

- 标签小、输入大；标签永远在输入框上方，不用占位符代替标签。
- 错误信息写在输入框下方，用 `--danger`，并说明如何修正。

## 表格

```css
table.data{width:100%;border-collapse:collapse;font-size:13px}
table.data th{
  padding:9px 12px;text-align:left;font:500 10px/1.5 var(--mono);
  letter-spacing:.1em;color:var(--ink-dim);
  border-bottom:1px solid var(--line);white-space:nowrap;
}
table.data td{padding:11px 12px;border-bottom:1px solid rgba(255,255,255,.08);vertical-align:top}
table.data .num{font-family:var(--mono);text-align:right}
```

- 表头无背景，只加底线。
- 数值列右对齐、等宽。
