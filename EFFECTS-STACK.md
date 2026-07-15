# FRISSON · 感官特效技术选型(the most exquisite 卡片)

目标:每张卡片居中时,背景用精密特效表达该感官 + 由图片延伸的模糊背景配色。

---

## 一、技术栈结论

- **不需要换框架。** 下列库都是 `<script>` / ES module,可直接接入现有静态站。
- **建议的唯一小升级:引入 Vite**(打包/管理 GLSL shader 文件、tree-shaking)。不是框架,不动 HTML/CSS。
- **不建议上 React / r3f** —— 那是整站重写,除非以后整站都做成 WebGL 场景。
- **GSAP 现在完全免费**(含全部原付费插件),用于过渡/编排/滚动触发,首选。

推进方式:**一个效果一个独立原型**,验证观感 + 性能(尤其手机发热),再逐个并入卡片。

---

## 二、筛选出的库(开源为主,标注付费)

### A. 图片 → WebGL + shader(做「背景模糊延伸配色」和卡片上加效果)
| 库 | 说明 | 许可 |
|---|---|---|
| **curtains.js** | 把 HTML `<img>` 变成 WebGL 平面,用 CSS 定位、用 shader 动画。轻、纯 vanilla、零依赖。 | MIT 免费 |
| **VFX-JS** (fand, Codrops 2025) | 全屏 WebGL 覆盖层,给 DOM 图片/文字加效果;预设(bloom/像素化…)+ 自定义 GLSL。**最易上手**。 | MIT 免费 |
| **glfx.js** | 经典图片效果库(位移、扭曲等)。 | 免费 |

### B. 水波 / 流体 / 光照(dynamic lighting、temperature 的水)
| 库 | 说明 | 许可 |
|---|---|---|
| **PavelDoGreat / WebGL-Fluid-Simulation** | 著名流体模拟,手机也能跑。适合「scent 扩散色团」「流体感」。 | MIT 免费 |
| **WebGL-Fluid-Enhanced** | 上者的现代 npm 模块版。 | MIT 免费 |
| **dghez / mouse-effects-webgl-water** | 鼠标跟随的真实水波(ping-pong 缓冲、色散、高光)。专为图片,**正好对应 dynamic lighting 的鼠标水波**。 | 开源 |
| **PixiJS** | 2D WebGL 渲染器,自带 displacement 位移滤镜、粒子;性能好、概念比 3D 轻。 | MIT 免费 |

### C. 粒子 / 气流 / 星空(air composition、temperature 的星空)
| 库 | 说明 | 许可 |
|---|---|---|
| **tsParticles** | 高度可定制粒子;有 **curl-noise 流场插件**(`@tsparticles/path-curl-noise`)—— 完美对应「air composition 稀薄气流」和「星空点点」。框架无关(含 vanilla)。 | MIT 免费 |

### D. 底层 / 自定义 shader(sound design 声波、scent 云、任何独有效果)
| 库 | 说明 | 许可 |
|---|---|---|
| **Three.js** | WebGL 事实标准,写自定义 shader 场景最通用。 | MIT 免费 |
| **OGL** | 极简 WebGL,像精简版 Three,适合手写 shader、体积小。 | MIT 免费 |

### E. 编排 / 动画
| 库 | 说明 | 许可 |
|---|---|---|
| **GSAP** | 过渡、ScrollTrigger、SplitText 等。2025 起**全部免费**(含原付费插件)。 | 免费 |

> 付费墙的基本没必要了:最强的编排(GSAP)已免费,视觉效果开源库足够强。真要付费素材,可去 Codrops「Tympanus」的 premium demo,但源码质量开源库已覆盖。

---

## 三、五个感官 → 具体方案

1. **cinematic sound design**(四面八方袭来的优雅声波曲线)
   → 自定义 GLSL / canvas 正弦波叠加(和你长寿页丝线同类)。库:**OGL / Three.js** 全屏 shader,或直接手写 canvas。

2. **dynamic lighting**(随鼠标的水波纹光照)
   → **dghez/mouse-effects-webgl-water** 或 **PixiJS displacement** 或 **curtains.js** 水波 shader。

3. **temperature haptic**(上方星空点点 + 下方水波灵灵)
   → **tsParticles**(上半星空)+ 水波 shader(下半);或单个 shader 上下分区。

4. **environment scent**(从中间扩散的模糊云朵色团)
   → **WebGL 流体(PavelDoGreat)** 或 curl-noise 噪声云 shader;最省则「模糊径向渐变 + 噪声」。

5. **air composition**(稀薄而高清的气流)
   → **tsParticles curl-noise 流场**(`@tsparticles/path-curl-noise`)。

**背景模糊延伸配色**(所有卡片通用)→ **curtains.js / VFX-JS** 取图片采样→模糊→染背景;或提取主色 + CSS 大模糊。

---

## 四、建议下一步

先做**一个独立原型**验证观感 + 手机性能。推荐先做 **dynamic lighting(鼠标水波)** 或 **sound design(声波曲线)** —— 最直观、最能定调。确认后再逐个接入,并统一「滚出屏幕即停 / 移动端降负载」(避免像长寿页那样发热)。
