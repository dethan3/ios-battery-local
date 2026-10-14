# iOS 硬件检测

面向 iPhone Safari 的本地硬件与电池分析 PWA。无后端、上传、第三方脚本或统计；可安装、缓存应用资源并离线读取文件。产品名称是 iOS 硬件检测，原仓库地址保留。

## 使用

选择本机文件，可多选（最多 20 个），每个文件分别出报告。网页没有扫描 iOS 分析数据目录的权限，不能替你选择未授权文件。

- 全面硬件线索：sysdiagnose TAR / TAR.GZ / ZIP，或已解压的 IODeviceTree、IOService、remotectl_dumpstate 文本。
- 电池记录：诊断包内 `logs/BatteryBDC` 最新一份每日表格的最后一行，`logs/BatteryHealth` 文本，以及 Analytics 开头的 `.ips`、`.ips.ca.synced`。支持 JSON 序列、逐行 JSON、带空格的键值、XML 与这些文件中的二进制 plist 标量。每份文件单独出报告，同一文件里的不同设备标识也不会合并。
- JetsamEvent 是内存终止诊断；崩溃报告也不等于完整硬件报告。

文件输入不设扩展名过滤，避免 Safari 将 `.ips.ca.synced` 显示为灰色。按内容识别压缩包，不假定所有文件是单个 JSON。工作线程分块读取，不将整个诊断包解压到内存或磁盘。

## 结果含义与覆盖范围

提供设备代码、系统和容量等可用字段，以及屏幕、电池、闪存、内存和四类摄像头的证据行。厂商必须来自明确字段或支持的节点上下文。显示原始键、记录和来源；相互矛盾的值保留，不推定最新值。不凭设备型号填入某一批次供应商。

vendors.js 收有公开来源的代号前缀：屏幕 G9N/G9P/G9Q、GH3/GVC、J5V，电池 F5D/F8Y/FG9/F9Y。显示为资料对照，可关闭；不是 Apple 官方认证，也不给出顶级或优秀之类的档次。京东方有部分机型的 OLED 供货报道，J5V 只是社区序列号前缀。B02/B03 公开说法不一致，不收录。日志直接写出的厂名会换成常用中文名。没有收录的代号保持未识别。缺少字段显示未识别。传感器、模组、电芯厂等不能混为同一供应商。

电池提取循环次数、最大容量百分比、标称/原始最大/设计容量、MaximumFCC 等已知别名。按文件、设备标识和来源分组，不跨记录拼凑容量比。缺失不等于零，保留原始单位；同一对象的标称/设计比值只是算术估算，不当作官方健康度。

这不是系统电池分析 App 的功能等价实现。当前无法解码所有私有部件标识、相机校准数据或其他无关二进制，也没有可验证的完整供应商数据库。不提供顶级/优秀等质量排名、原装鉴定或维修结论。另有依靠用户观察的纯色屏幕、触控轨迹和摄像头实时预览；浏览器不保证访问每个物理镜头。

## 大文件与限制

单文件和展开读取预算均为 2 GiB；选中 TAR 成员最大 512 MiB；最多 20000 条目。JSON 单记录超过 2 MiB、文本单行超过 256 KiB 会跳过并提示结果不完整；证据、设备分组也有数量上限。ZIP 支持存储/deflate，校验 CRC；不支持加密、分卷或 ZIP64。损坏压缩包拒绝成功报告。TAR 仅读取白名单相关文件，ZIP 仅展开选中的成员；原始包不会保存。不是完整 sysdiagnose 通用解析器。

300 多 MB 的诊断包在技术上可以处理，但并非每个 Analytics 文件都这么大，也不证明某 App 的实际输入大小。桌面合成压力测试不代表所有 iPhone 的可用内存或真实日志兼容性。失败时可在本机解压，仅选择相关文本。

## 隐私、离线和更新

默认文件及结果只在内存。序列号在提取时遮盖，设备标识只用于区分记录，不写入结果。只有点击保存才写入浏览器 IndexedDB（最多 20 份脱敏报告）；可逐项删除，清除本次记录只清内存。导出不含原文件名、完整日志、完整序列号或原始设备标识；提取的日期、地区、容量和证据仍需分享前检查。

摄像头仅主动点击后请求权限，不录制、不上传；关闭预览、收起检查或离开页面时停止。日志文本使用 textContent 渲染；CSP 限制同源资源与禁止表单提交。

Safari 分享 → 添加到主屏幕。首次联网等离线资源就绪后可断网打开；系统仍可能清除缓存。Service worker 只缓存明确列出的应用资源，不缓存输入文件。联网打开或刷新时优先取服务器资源；新版缓存自动激活，无手动更新入口。断网时回退到已完整安装的资源缓存，不强制刷新正在分析的页面。首次加载和更新会访问 GitHub Pages，托管方可能记录 IP 等访问元数据。

## 开发与测试

Node.js 22+：`npm test`（或 `node --test tests/*.test.js`），`npm start`（或 `node tools/serve.js`）。无运行时第三方依赖。服务工作线程需 HTTPS / localhost；所有资源路径相对，兼容 GitHub Pages 仓库子路径。具体通过项与未验证项见 VALIDATION.md。

## 依据

- [公开 IODeviceTree 原始样本](https://gist.github.com/bazad/1faef1a6fe396b820a43170b43e38be1)：硬件键的实例，不代表所有系统均公开相同字段。
- [sysdiagnose-extractor-library](https://github.com/IsMyPhonePwned/sysdiagnose-extractor-library)：诊断包目录与相关记录的公开实现参考。
- [屏幕代码社区观察](https://www.reddit.com/r/iphone18pro/comments/1wss5qr/sidebyside_display_comparison_gvclg_vs_g9nsamsung/)：候选映射，不是官方查询表。
- [Apple 官方诊断说明](https://developer.apple.com/feedback-assistant/profiles-and-logs/)与[部件和维修历史](https://support.apple.com/en-us/102658)。

独立工具，与 Apple 或系统电池分析 App 无关联。真实用户日志未加入仓库，生产页面没有示例数据按钮。



## 2.1.0 · 真实诊断包修正

结果页取消整机概览大卡，设备原始字段与扫描统计收进详情。ProductName 仅接受整机名称，硬件节点不再占用设备字段预算。排除 ProxiedDevice 配对设备日志及 AppleDouble `._` 附属文件，避免把手表的电池与容量放进 iPhone 报告。

IORegistry 文本不再按 JSON 大对象扫描；读取 BatteryData 内受支持的容量标量。FullChargeCapacity 与 MaximumFCC 分开保留，避免不同含义的容量混成冲突值。补充 AppleANS 存储型号和四类 CameraModuleSerialNumString 字段，序列号在提取时遮盖，未知前缀仅显示代码，不猜厂商。

BatteryBDC 按实际行时间选记录，保留源文件、行号、BatteryIndex 和是否注明时区。没有有效时间时只取同一文件的最后一行，不声称最新。不同 BatteryIndex 不合并。默认展示每日电池记录；其他来源可切换，不跨来源拼出健康度。104% 等超过 100 的容量比例原样保留并解释为日志值，不等同设置中的电池健康；循环记录为零也不判断是否使用过。主页面只展示存在的数值，原始路径进入来源详情。
