# Contributing / 贡献指南

Thanks for your interest in Circle Limit Butterflies! 感谢你的关注 🦋

## Getting started / 开始

```bash
bun install
bun run dev
```

Before opening a pull request, make sure both pass / 提交 PR 前请确保通过：

```bash
bun run lint
bun run build
```

## Project structure / 项目结构

- `src/app/page.tsx` — the Circle Limit parametric studio / 圆极限调参工作室
- `src/app/play/page.tsx` — the "Symmetry Smith" game / 「对称匠」游戏
- `src/lib/butterfly/` — config, hyperbolic geometry, wing path generation / 配置、双曲几何、翅膀路径生成
- `src/lib/game/` — game engine + Web Audio sound engine / 游戏逻辑 + 声音引擎
- `src/components/studio/` · `src/components/game/` — UI components / 界面组件
- `src/i18n/locales/` — `en-US.json` + `zh-CN.json` translations / 翻译文案

## Guidelines / 约定

- Keep user-visible copy in the locale files (`en-US` + `zh-CN`), rendered via `t()`. 所有用户可见文案走 i18n，勿硬编码。
- Match the existing Pop-checker visual tokens and code style. 沿用现有视觉与代码风格。
- Keep changes focused; describe the "why" in your PR. 保持改动聚焦，PR 中说明动机。

## Reporting issues / 反馈问题

Open a GitHub issue with clear steps to reproduce. 请附清晰的复现步骤。

## License / 许可

By contributing, you agree your contributions are licensed under the [MIT License](./LICENSE).
提交贡献即表示同意以 MIT 许可证授权。
