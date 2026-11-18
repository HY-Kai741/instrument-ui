# 材质层：背景与渐进效果

识别度的一半在静态版式，另一半在这里。缺了这层，页面会变成普通深色后台。

## 层次

```text
z-index 0   星云（CSS radial-gradient + 26s 漂移）
z-index 1   星轨画布（canvas）+ 地平线星球（CSS）
z-index 2   顶部压暗（linear-gradient）
z-index 3   页面内容
```

内容容器必须 `position: relative; z-index: 3`，否则会被压暗层盖住。

## 1. 星云

```css
.bg-nebula{
  position:fixed;inset:-12%;z-index:0;pointer-events:none;
  background:
    radial-gradient(ellipse 58% 48% at 18% 30%,rgba(38,91,128,.36),transparent 66%),
    radial-gradient(ellipse 42% 38% at 84% 18%,rgba(132,50,64,.18),transparent 68%),
    radial-gradient(ellipse 64% 46% at 58% 92%,rgba(38,65,83,.28),transparent 70%);
  background-size:145% 145%;
  animation:bg-drift 26s ease-in-out infinite alternate;
}
@keyframes bg-drift{
  from{transform:translate3d(-1.2%,-1.6%,0) scale(1)}
  to{transform:translate3d(1.4%,1.2%,0) scale(1.06)}
}
```

三层径向渐变：冷蓝主光、右上少量暖红、底部青灰。比例和位置比颜色更重要；换品牌色时保留「大椭圆 + 低透明度 + 缓慢漂移」。

## 2. 星轨

`assets/background.js` 是原项目 `initStarfield()` 的精简移植，参数一致：

- 三层视差：速度 `0.006 / 0.018 / 0.038`，透明度 `0.28 / 0.56 / 0.82`，尺寸 `0.46 / 0.9 / 1.45`。
- 星数按宽度：`<700px` 150 颗，`<1200px` 280 颗，否则 380 颗。
- 星体从中心 `(61%, 27%)` 向外缓慢扩散，形成「飞行」视差；滚动时加速（`scrollBoost`），停止后衰减。
- 指针移动带来 30px / 20px 的视差偏移。
- 最远层有十字光晕；少量星体带 glow 精灵。
- 流星每 3.2–7.8s 随机生成，最多 2 颗。
- DPR 上限 1.75；页面隐藏时停止 rAF。

用法：

```html
<canvas class="starfield" data-starfield aria-hidden="true"></canvas>
<script src="background.js"></script>
```

## 3. 地平线星球

原项目用 Three.js 渲染夜面地球（城市灯光 + 大气边缘）。在 CSS 里可以做到接近的效果，只需要一张 `1024×512` 的夜面贴图（`assets/earth-night.jpg`，44KB）：

```css
.planet{
  position:fixed;right:-36vw;top:-26vh;z-index:1;pointer-events:none;
  width:min(1280px,115vw);aspect-ratio:1;border-radius:50%;overflow:hidden;
  background:radial-gradient(circle at 64% 42%,#071825 0%,#040e17 52%,#020810 100%);
  box-shadow:
    0 0 190px 60px rgba(38,91,128,.20),
    inset 0 0 24px 2px rgba(120,190,255,.22),
    inset -30px -40px 90px rgba(74,159,232,.18);
  mask-image:linear-gradient(90deg,transparent 0%,rgba(0,0,0,.18) 40%,#000 70%,#000 100%);
  opacity:.86;
}
.planet::before{
  content:"";position:absolute;inset:0;
  background:url("./earth-night.jpg") repeat-x 0 50%/50% 100%;
  mix-blend-mode:screen;
  filter:saturate(1.2) contrast(1.08) brightness(1.18);
  mask-image:radial-gradient(circle at 50% 50%,transparent 52%,rgba(0,0,0,.45) 68%,#000 84%);
  animation:planet-spin 260s linear infinite;
}
@keyframes planet-spin{
  from{background-position-x:0%}
  to{background-position-x:-100%}
}
.planet::after{
  content:"";position:absolute;inset:0;border-radius:50%;
  background:radial-gradient(circle at 38% 32%,rgba(0,0,0,0) 26%,rgba(2,6,10,.5) 70%,rgba(1,4,7,.94) 100%);
  box-shadow:inset 0 0 90px 12px rgba(2,6,10,.9),inset 0 0 48px 4px rgba(74,159,232,.14);
}
```

关键的三个处理：

1. **只留灯带**：`::before` 的径向遮罩把球心压暗，只保留靠近边缘的城市灯光，避免看起来像一张平铺的地图。
2. **横向平铺滚动**：`repeat-x` + 50% 宽度 + `background-position-x` 位移，形成 4 分钟一圈的自转，不需要 WebGL。
3. **柔边**：用 `inset 0 0 24px` 的柔光代替 1px 硬描边；硬线会读成 UI 分割线，而不是大气边缘。

没有贴图时，退化为纯 CSS 版本：去掉 `::before`，把背景换成
`radial-gradient(circle at 34% 30%,#0a1724 0%,#071019 38%,#040b12 62%,#02060b 82%,#010407 100%)`，
保留同样的 `mask-image` 与阴影。视觉上只剩一段暗弧，没有城市灯光。

授权：贴图来自 Solar System Scope，CC BY 4.0，见 `assets/CREDITS-earth.md`。商用或公开发布时必须保留署名。

- 只露右上方一段弧，不出现完整球体。
- 左侧用 `mask-image` 淡出，避免和正文抢边界。
- 移动端（≤900px）直接 `display:none`。

## 4. 压暗层

```css
.bg-veil{
  position:fixed;inset:0;z-index:2;pointer-events:none;
  background:linear-gradient(180deg,rgba(4,7,10,.04) 0%,rgba(4,7,10,.28) 58%,rgba(4,7,10,.68) 100%);
}
```

底部更暗，保证长页面滚动时正文始终可读。

## 5. 悬停光斑 + 边线绘制

两块效果叠加在同一元素上：

1. **边线绘制**：两条 1px 渐变作为 `background-image`，`background-size` 从 `0%` 过渡到 `100%`，鼠标进入时「画出」上边和左边。
2. **跟随光斑**：`::after` 里一个 `radial-gradient(220px circle at var(--mx) var(--my), …)`，JS 写入百分比坐标。

```css
.spot{
  position:relative;isolation:isolate;--mx:50%;--my:50%;
  background-image:
    linear-gradient(90deg,transparent,rgba(113,218,207,.9),transparent),
    linear-gradient(180deg,rgba(113,218,207,.9),transparent);
  background-position:left top,left top;
  background-size:0% 1px,1px 0%;
  background-repeat:no-repeat;
  transition:transform .22s cubic-bezier(.2,.75,.25,1),
             background-size .45s cubic-bezier(.2,.75,.25,1),
             background-color .22s ease,border-color .22s ease,box-shadow .22s ease;
}
.spot:hover{transform:translateY(-2px);background-size:100% 1px,1px 100%}
```

尺度：卡片抬 `2px`，列表行抬 `1px`；不要给整块文字加发光。

## 6. 按钮扫光

主按钮背景是 300% 宽的青绿渐变，悬停时 `background-position` 从 `0%` 走到 `100%`，形成一次横向扫光。

```css
.btn-primary{
  background-image:linear-gradient(90deg,#17a78c 0%,#3ac8b4 30%,#6fd9cc 50%,#3ac8b4 70%,#17a78c 100%);
  background-size:300% 100%;
  transition:background-position .5s cubic-bezier(.4,0,.2,1),transform .18s ease;
}
.btn-primary:hover{background-position:100% 0;transform:translateY(-1px)}
```

不循环、不自动播放，只在交互时发生。

## 7. 渐入

```css
.reveal{
  opacity:0;transform:translateY(14px);
  transition:opacity .6s cubic-bezier(.2,.75,.25,1),transform .6s cubic-bezier(.2,.75,.25,1);
  transition-delay:calc(var(--i,0) * 70ms);
}
.reveal.is-in{opacity:1;transform:none}
```

`background.js` 用 `IntersectionObserver`（`rootMargin: -12%`）触发一次，`--i` 控制 70ms 的级联节奏。首屏区块依次进入，不要超过 4 级，否则等待感明显。

## 8. 性能与降级

| 条件 | 处理 |
| --- | --- |
| `prefers-reduced-motion: reduce` | 关闭星轨、漂移动画、位移和渐入；保留静态背景与颜色 |
| 宽度 `<900px` | 隐藏星球，星轨降到 0.6 透明度 |
| 宽度 `<700px` | 星数降到 150 |
| 页面隐藏 | 停止 `requestAnimationFrame` |
| 表单页、设置页、长文页 | 只留星云 + 压暗层，不要星轨和星球 |

原则：材质层不能影响阅读、不能拖慢首屏、不能在没有 GPU 加速的环境里造成掉帧。任何一页关掉 material 层后，信息层级必须仍然成立。
