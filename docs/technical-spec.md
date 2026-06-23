# 技术规范文档 — Touch Tang 🐾

## 技术栈
- 纯 HTML + CSS + JavaScript
- 不使用任何框架或库（方便部署到 GitHub Pages）
- 唯一外部依赖：Google Fonts（Baloo 2 字体）

## 文件清单

| 文件 | 说明 |
|------|------|
| `index.html` | 主页面 |
| `style.css` | 所有样式 |
| `script.js` | 交互逻辑（鼠标跟踪、语言切换、预加载、双击） |
| `cat.m4a` | 猫叫声（双击触发） |
| `tang_pic/*.png` | 猫咪图片（18 张） |

## 图片详情

- 所有图片尺寸约 1448×1086 像素
- `09.png` 宽度为 1449px（比其他多 1px）— CSS 固定显示尺寸可避免抖动
- 网页中统一显示宽度约 500px（桌面端），手机端等比缩小

## 角度计算公式

```
屏幕坐标系：x 向右，y 向下

dx = mouseX - catCenterX
dy = mouseY - catCenterY  （鼠标在猫咪下方时 dy 为正）

角度（从正下方顺时针）：
  angle = Math.atan2(-dx, dy)
  if (angle < 0) angle += 2 * Math.PI
  index = Math.round(angle / (Math.PI / 8)) % 16

验证：
  正下方 (dx=0, dy>0):     angle=0       → index=0  → "00" ✓
  正右   (dx>0, dy=0):     angle=3π/2    → index=12 → "12" ✓
  正上方 (dx=0, dy<0):     angle=π       → index=8  → "08" ✓
  正左   (dx<0, dy=0):     angle=π/2     → index=4  → "04" ✓
```

## 中心死区

- 鼠标距离猫咪中心 < 80px → 显示 `x.png`
- 鼠标离开网页 → 显示 `x.png`

## 多语言实现

- 使用 JavaScript 对象存储所有翻译文本
- HTML 元素使用 `data-i18n` 属性标记需要翻译的文本
- 语言选择保存到 `localStorage`，刷新后保持
- 默认语言：检测浏览器语言，不支持时回退到英文

## 音频处理

- 猫叫声：`cat.m4a`，双击时通过 `<audio>` 元素播放
- 背景音乐：`<audio>` 元素带 controls 属性，用户手动播放
- 背景音乐文件由用户后续提供，目前播放器 src 为空

## 图片预加载

- 页面加载时创建 `Image` 对象预加载全部 18 张图片
- 显示简单 loading 提示直到全部加载完成
- 确保鼠标移动时图片切换无延迟

## 已知问题

- `09.png` 宽度 1449px，其他图片 1448px — 通过 CSS 固定宽高解决
- `cat.m4a` 是 M4A 格式，不是 MP4 — 现代浏览器均支持
