# 圆极限蝴蝶 · Circle Limit Butterflies 🦋

[English](#english) | [中文](#中文)

An interactive **Circle Limit (Poincaré disk) hyperbolic butterfly** studio + game — inspired by M.C. Escher's *Circle Limit* woodcuts and the mathematics of hyperbolic tessellations. Sculpt fractal butterflies, arrange them along hyperbolic geodesics by `{p,q}` symmetry groups, then play a rhythm-of-symmetry game with synthesized pentatonic chords.

> Built on the [Eazo](https://eazo.ai) Next.js template. Licensed under MIT.

---

## 中文

### ✨ 功能

- **圆极限调参工作室**：在庞加莱圆盘中沿双曲测地线按 `{p,q}` 对称群实时排布分形蝴蝶，越靠边界越小，重现埃舍尔式收敛美感。
- **翅膀节点编辑器**：≥16 个可拖拽轮廓控制点 + 切线手柄 + 贝塞尔平滑，逐点雕刻蝴蝶形态。
- **完整色彩系统**：5 套配色方案、≥4 色标多段渐变、逐段透明度、翅膀正反面色差。
- **细节与动画**：脉络显隐/粗细、纹理密度、光影角度/强度、边缘描边、镜像翻转、飞行动画。
- **「对称匠」游戏**：圆盘里一只蝴蝶偏离对称，拖动旋转（必要时镜像翻转）对准虚影轮廓即可契合；45 秒计时、精准度 + 连击得分、难度递增。
- **声音交互**：纯 Web Audio 实时合成——每只蝴蝶对应五声音阶的一个音，契合成功奏出清亮和弦（无音频文件）。
- **中英双语**，波普棋格视觉风格，移动优先。

### 🎮 玩法

顶部「游戏」进入「对称匠」：拖动圆盘旋转偏离对称的蝴蝶，对准淡淡的虚影轮廓即契合并奏出和弦。越准、越快、连击越高，得分越多。（浏览器策略：声音需在页面内先轻点一次解锁。）

### 🚀 本地运行

需要 [Bun](https://bun.sh)。

```bash
bun install
bun run dev
```

打开 http://localhost:3000 。

常用命令：

```bash
bun run lint    # 代码检查
bun run build   # 生产构建
```

### 🧮 数学背景

- **庞加莱圆盘模型**：双曲几何的一种模型，直线表现为与边界圆正交的圆弧，角度保持、距离向边界压缩。
- **`{p,q}` 对称群**：Schläfli 符号，描述每个顶点有 `q` 个正 `p` 边形相接的双曲镶嵌；当 `1/p + 1/q < 1/2` 时为双曲铺陈。
- 母题（蝴蝶）经 Möbius 变换沿测地线向边界无限缩小，正是埃舍尔 *Circle Limit* 系列的核心思想。

### 🛠 技术栈

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · SVG · Web Audio API · react-i18next · Bun。

---

## English

### ✨ Features

- **Circle Limit studio** — arrange fractal butterflies along hyperbolic geodesics by `{p,q}` symmetry groups in a Poincaré disk; motifs shrink toward the boundary for that Escher-style convergence.
- **Wing node editor** — 16+ draggable contour control points with tangent handles and bezier smoothing to sculpt each butterfly.
- **Full color system** — 5 palettes, 4+ gradient stops, per-stop opacity, front/back wing color delta.
- **Detail & animation** — veins, texture density, light angle/intensity, edge stroke, mirror flip, flight animation.
- **"Symmetry Smith" game** — a butterfly drifts out of symmetry; drag to rotate (and flip) it onto a ghost target to snap it into place. 45s timer, precision + combo scoring, rising difficulty.
- **Sound interaction** — fully synthesized Web Audio: each butterfly maps to a pentatonic note; a successful snap sounds a bright chord (no audio files).
- **Bilingual (EN/中文)**, Pop-checker visual style, mobile-first.

### 🚀 Getting started

Requires [Bun](https://bun.sh).

```bash
bun install
bun run dev
```

Open http://localhost:3000 .

### 🧮 Math background

Uses the **Poincaré disk model** of hyperbolic geometry — geodesics are circular arcs orthogonal to the boundary — and **`{p,q}` symmetry groups** (Schläfli symbol) to tile the hyperbolic plane, exactly the idea behind Escher's *Circle Limit* prints.

### 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md).

### 📄 License

[MIT](./LICENSE) © 2026 LotusLiuXY
