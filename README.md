<div align="center">
  <img src="./icon.svg" width="96" height="96" alt="iOS 硬件检测 Logo">
  <h1>iOS 硬件检测</h1>
  <p><strong>把系统诊断记录，变成看得懂的硬件与电池报告。</strong></p>
  <p>本地解析 · 文件不上传 · 可安装 PWA · 离线可用</p>
  <p>
    <a href="https://dethan3.github.io/ios-hardware-check/"><strong>打开在线工具 ↗</strong></a>
    &nbsp;·&nbsp;
    <a href="#开始使用">开始使用</a>
    &nbsp;·&nbsp;
    <a href="#隐私与数据">隐私与数据</a>
    &nbsp;·&nbsp;
    <a href="https://github.com/dethan3/ios-hardware-check/issues">反馈问题</a>
  </p>
</div>

---

**iOS 硬件检测**是一个面向 iPhone Safari 的轻量网页工具。选择你导出的系统诊断包或分析日志，在设备本地查看可用的部件厂商、型号、容量、序列号前缀和电池记录。

无需注册、安装原生 App 或把几百 MB 的诊断包交给服务器。原始文件在浏览器工作线程中分块读取；每个结论都能展开查看字段与来源。文件没有提供的信息保持未知，资料对照得到的供应商标为候选。

## 看一眼界面

<table>
  <tr>
    <th>选择文件与操作引导</th>
    <th>硬件结果与识别依据</th>
  </tr>
  <tr>
    <td><img src="./docs/start.png" width="300" alt="手机界面：选择本机诊断文件与生成日志的步骤"></td>
    <td><img src="./docs/hardware.png" width="300" alt="虚构数据的硬件展示：厂商、容量、类型及未确认的摄像头代码"></td>
  </tr>
</table>

右图使用**虚构测试数据**，仅展示界面与信息层次，不是某台设备的检测证明。生产页面没有示例数据入口；真实用户日志不随项目发布。

## 能看到什么

| 项目 | 可读取的内容 | 如何解释 |
| --- | --- | --- |
| 屏幕 | 面板序列号前缀、可用厂商或型号字段 | 明确厂商文本直接展示；前缀按本地资料表显示候选 |
| 电池 | 厂商、部件代码、循环次数及多种容量记录 | 电池配置与电池统计分别保留来源，不用缺失值代替零 |
| 闪存 / 存储 | NAND 厂商、TLC / QLC 等类型、日志容量、SSD 型号、芯片代码 | 区分控制器厂商与 NAND 厂商，保留类型及容量的读取依据 |
| 运行内存 | 厂商、容量、LPDDR 类型 | 支持已知 `dram-size` 小端字节格式，显示 GiB 换算依据 |
| 摄像头 | 前置、主摄、超广角、长焦的可用模组代码或厂商文本 | 未知代码不猜厂商；模组、传感器和镜头供应商不能混为一谈 |
| 基带与无线模组 | 日志中存在的芯片代号、模组代码或相关参数 | 有字段才显示，不把内部代号擅自转换为商业型号 |
| 设备信息 | 设备代码、系统版本及其他支持字段 | 放在原始字段详情中，不把硬件节点名称拼成整机名称 |

此外，工具提供纯色屏幕、触控轨迹与前后摄像头预览，方便你手动观察功能是否正常。摄像头只在主动点击后请求权限，不拍照、不录制、不上传；浏览器不能保证访问每一个物理镜头。

### 电池记录，按来源看

- **每日记录**：读取 BatteryBDC 表格中实际时间较新的记录，保留原文件与行号；可按电池编号区分记录。
- **诊断快照**：读取 IORegistry 中受支持的电池字段，包括内嵌 BatteryData 的容量记录。
- **其他来源**：支持 BatteryHealth、相关 plist 和独立 Analytics 日志中的已知字段。
- **只显示存在的数值**：循环次数、日志容量比例、标称容量、原始满充容量、设计容量、MaximumFCC 和 FullChargeCapacity 等分别保留。

> 日志容量比例可能超过 100%，不等同于「设置」中的电池健康。循环次数为 0 只表示日志记录为 0，不能据此断定设备没有使用过。不同来源、不同时间的容量不会被拼成一个健康度。

## 开始使用

### 1. 选择适合你的记录

| 你想了解什么 | 优先选择 | 备注 |
| --- | --- | --- |
| 硬件配置与供应商线索 | `sysdiagnose_….tar.gz` 系统诊断包 | 通常包含 IORegistry 和电池记录，覆盖范围更广 |
| 电池统计 | `Analytics-….ips` 或 `.ips.ca.synced` | 文件可能没有完整硬件信息 |
| 已在本机解压诊断包 | IODeviceTree、IOService、IOPower 及相关电池文件 | 可减少浏览器需要扫描的数据量 |

`JetsamEvent` 是内存终止报告，应用名称开头的 `.ips` 通常是应用诊断，它们不是完整硬件配置文件。网页无法自行扫描 iOS 的「分析数据」目录，只会读取你主动选中的文件。

### 2. 生成并保存 sysdiagnose

1. 在 iPhone 中进入「设置 → 辅助功能 → 触控 → 辅助触控」。
2. 把支持的自定操作或菜单项设为「分析」，触发后等待系统收集完成。
3. 进入「设置 → 隐私与安全性 → 分析与改进 → 分析数据」，找到新生成的 `sysdiagnose_` 文件。
4. 点开并通过分享菜单保存到「文件」。

也可使用机型对应的组合按键方式。操作方法与等待时间依设备、系统不同，请以 [Apple 官方诊断说明](https://developer.apple.com/feedback-assistant/profiles-and-logs/)中的 **Sysdiagnose for iOS/iPadOS** 为准。完整诊断包可能达到几百 MB，大小不是固定值。

### 3. 导入并查看

打开 [iOS 硬件检测](https://dethan3.github.io/ios-hardware-check/)，点击「选择诊断文件」。读取完成后：

1. 在「硬件配置」查看摘要，点开部件行查看字段、来源和对照依据。
2. 在「电池记录」查看记录类型与时间，必要时切换其他来源。
3. 按需导出脱敏报告，或主动保存到此浏览器。

一次最多选择 **20 个文件**，每个文件分别生成报告。文件输入不按扩展名过滤，支持选择 `.ips.ca.synced`；压缩格式按内容识别，不把所有日志都当作单个 JSON。

### 4. 添加到主屏幕与离线使用

在 Safari 分享菜单中选择「添加到主屏幕」。首次联网等待“离线资源已就绪”，之后可尝试断网打开并读取本机文件。

联网打开或刷新时优先读取服务器资源；离线时回退到已安装的应用缓存，无需手动点击更新。系统可能清除网站缓存，离线能力仍取决于缓存是否完整。正在分析的页面不会被强制刷新。

## 结果的依据与边界

我们把三类信息分开呈现：

| 标识 | 含义 | 例子 |
| --- | --- | --- |
| 日志直接记录 | 文件明确提供厂商或参数 | NAND 的 `vendor-name`、内存的 `dram-vendor` |
| 带依据的字段解读 | 按支持的字段格式读取或换算 | 字节容量换算 GB / GiB、每单元 bit 数对应 TLC / QLC |
| 代码对照 · 未验证 | 用部件前缀查本地资料表 | 屏幕或电池供应商候选，可关闭对照 |

当前前缀表包括屏幕 **G9N / G9P / G9Q、GH3 / GVC、J5V** 和电池 **F5D / F8Y / FG9 / F9Y**。规则与来源在 [vendors.js](./vendors.js) 中公开。它们不是 Apple 官方认证的完整数据库；有争议的 B02 / B03 未收录。未知前缀保留代码，不编造厂商或档次。

**本工具不做“顶级 / 优秀”等供应商质量排名，也不能凭日志证明原装、无维修或硬件没有故障。** 文件记录不是独立硬件检测；私有代码、机型差异和更换部件都可能影响解释。若要核对维修情况，可结合 [Apple 部件与维修历史](https://support.apple.com/en-us/102658)。

## 隐私与数据

**原始文件不会上传。** 项目没有接收诊断文件的后端，没有账号系统、第三方分析 SDK 或运行时 CDN 依赖。

| 操作 | 数据在哪里 | 是否保留原始日志 |
| --- | --- | --- |
| 选择并分析文件 | 当前页面与本地 Web Worker 内存 | 不主动持久化原文件 |
| 清除本次记录 | 清空本次内存结果并停止读取 | 不删除你在「文件」中保存的原件 |
| 保存到此设备 | 浏览器 IndexedDB，最多 20 份脱敏报告 | 只保存提取结果，可逐项删除 |
| 导出脱敏报告 | 下载到你选择的本机位置 | 不导出完整日志、原文件名或原始设备标识 |
| 离线缓存 | Service Worker 的应用资源缓存 | 只缓存明确列出的网页资源，不缓存输入文件 |

部件与设备序列号在提取时遮盖。导出的日期、地区、容量、代码与来源字段仍可能透露设备信息，分享前请检查。

初次加载和更新会请求 GitHub Pages 的应用资源，托管方可能记录 IP 等访问元数据；“日志不上传”不等于“访问网站没有网络请求”。本工具也不会更改 Apple 的分析数据共享设置。

**反馈问题时，请不要提交完整 sysdiagnose、完整序列号或其他个人信息。** 优先提供已遮盖的截图、字段名称和必要的最小片段。

## 格式、性能与限制

| 项目 | 当前支持或预算 |
| --- | --- |
| 压缩包 | TAR、TAR.GZ、GZIP 文本、ZIP 存储 / deflate |
| 文本与结构化记录 | JSON 对象 / 序列 / 逐行记录、支持的键值文本、简单 XML plist、相关二进制 plist 标量、BatteryBDC CSV |
| 文件与展开数据 | 单文件最多 2 GiB；展开读取最多 2 GiB |
| 诊断包条目 | 最多 20,000 个；相关成员最多 512 MiB |
| CSV / plist | 单个相关结构化文件最多 8 MiB |
| 单条 JSON / 文本行 | 2 MiB / 256 KiB；超限会跳过并提示不完整 |
| 结果保留 | 设备字段与硬件证据各最多 250 条；电池来源分组最多 32 组 |
| 暂不支持 | 加密 ZIP、分卷 ZIP、ZIP64、未支持的压缩算法和任意私有二进制数据 |

读取在工作线程中分块进行，不把整个诊断包解压到内存或磁盘。仅选择受支持的相关成员，排除配对设备的 ProxiedDevice 日志、AppleDouble 附属文件及无关记录。受支持压缩格式的内容校验失败时，不接受成功报告。

这些预算是处理上限，不保证所有手机都能处理到该大小。设备内存、浏览器、包内文件结构及系统版本都会影响实际结果；必要时可在本机解压后只导入相关文件。

## 常见问题

<details>
<summary><strong>为什么有的部件还是“未识别”或“厂商未确认”？</strong></summary>

文件可能没有提供字段，或者代码没有可靠的厂商对照。有些摄像头日志只包含模组序列号，不能直接确定传感器厂、镜头厂或模组厂。工具会保留可读代码与来源，而不是用机型默认供应商填空。

</details>

<details>
<summary><strong>为什么电池数字与「设置」不一样？</strong></summary>

记录时间、统计口径及容量字段可能不同。MaximumFCC、FullChargeCapacity、NominalChargeCapacity 等分别保留，日志容量比例也不直接等同于设置中的电池健康。切换来源时先看记录时间与字段详情；没有明确单位的容量保留日志单位。

</details>

<details>
<summary><strong>“结果不完整”是不是文件坏了？</strong></summary>

不一定。它可能表示部分片段无法解析、结构超过预算或字段数量达到上限。已提取的字段仍可查看，但不应据此认为全部部件都已识别。展开“读取详情与限制”了解原因；压缩包完整性校验失败则会明确报错。

</details>

<details>
<summary><strong>文件灰色、无法选择，或大文件读取失败怎么办？</strong></summary>

先将记录通过分享菜单保存到「文件」，再从网页选择。工具不限制文件扩展名。如果压缩格式不受当前 Safari 支持，或包超过安全预算，可在本机解压后选择 IORegistry 文本及相关电池记录。

</details>

<details>
<summary><strong>保存的报告为什么在另一个浏览器里没有？</strong></summary>

报告保存在当前浏览器的网站数据库中，不会云端同步。其他浏览器、无痕窗口或清除网站数据后可能看不到；需要转移时，可主动导出脱敏报告。更换浏览器也不能自动迁移原有 PWA 的缓存或报告。

</details>

## 本地运行与开发

项目是静态 HTML / CSS / JavaScript，**无运行时第三方依赖、无构建步骤**。开发与测试需要 Node.js 22 或更新版本。

```bash
git clone https://github.com/dethan3/ios-hardware-check.git
cd ios-hardware-check
npm test
npm start
```

打开 `http://127.0.0.1:4173/`。无需先执行 `npm install`；也可直接运行 `node --test tests/*.test.js` 与 `node tools/serve.js`。

| 文件 | 职责 |
| --- | --- |
| [ingest.js](./ingest.js) | 文件识别、流式解压、诊断包成员筛选与校验 |
| [analyzer.js](./analyzer.js)、[plist.js](./plist.js) | 文本 / JSON / plist 字段提取、来源与记录分组 |
| [hardware.js](./hardware.js)、[hardware-summary.js](./hardware-summary.js) | 硬件字段解读、控制器与 NAND 区分、结果摘要 |
| [records.js](./records.js) | CSV、时间及电池来源选择 |
| [vendors.js](./vendors.js)、[rules.js](./rules.js) | 本地厂商名称、前缀规则与脱敏 |
| [worker.js](./worker.js)、[app.js](./app.js) | 后台读取、界面、报告导出与主动保存 |
| [sw.js](./sw.js) | 应用资源缓存、联网更新与离线回退 |

Service Worker 需要 HTTPS 或 localhost。资源使用相对路径，适配 GitHub Pages 仓库子路径；部署说明见 [PUBLISHING.md](./PUBLISHING.md)。

### 已验证与待验证

当前 **36 项自动测试通过**，覆盖文件格式、压缩包校验、上下文归属、脱敏、时间选择和硬件解读。约 303 MiB 的真实本地诊断包已在桌面 Chromium 与 WebKit 的 390 × 844 布局中验证导入、结果、来源切换和离线读取。

桌面 WebKit 不等同于真机 Safari。真实 iPhone 的安装、权限、缓存回收、更多系统版本和部件前缀仍需持续验证；测试不会证明完整供应商覆盖。完整记录见 [VALIDATION.md](./VALIDATION.md)。

## 参与改进

欢迎通过 [Issues](https://github.com/dethan3/ios-hardware-check/issues) 提交问题或可核验的字段资料。

- **解析问题**：描述文件类型、系统版本、预期结果和实际结果，附上脱敏后的必要片段。
- **厂商对照**：提供部件类别、代码前缀、适用机型 / 系统及可追溯的依据；一张 App 结果图可用于交叉对照，但不等于独立验证。
- **代码改进**：新增规则需带来源、保留不确定性，并添加上下文错误、冲突值与隐私相关的回归测试。

## 参考资料

- [Apple 官方诊断说明](https://developer.apple.com/feedback-assistant/profiles-and-logs/)：系统诊断的生成方法。
- [Apple 部件与维修历史](https://support.apple.com/en-us/102658)：官方部件与维修情况核对。
- [公开 IODeviceTree 样本](https://gist.github.com/bazad/1faef1a6fe396b820a43170b43e38be1)：硬件树字段实例。
- [sysdiagnose-extractor-library](https://github.com/IsMyPhonePwned/sysdiagnose-extractor-library)：诊断包目录与解析实现参考。
- [iPhone sysdiagnose parser](https://github.com/ThatLastGamer/iPhone-sysdiagnose-parser/blob/main/sysdiagnose_inspect.py)：存储属性与内存格式参考。
- [KIOXIA 多值存储技术说明](https://www.kioxia.com/en-jp/rd/technology/multi-level-cell.html)：每单元 bit 数与 SLC / MLC / TLC / QLC 的定义。

---

<div align="center">
  <p><strong>读得到的，给出依据；读不到的，保留未知。</strong></p>
  <p>独立项目，与 Apple 或其他诊断 App 无关联。</p>
</div>
