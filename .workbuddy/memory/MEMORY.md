# 项目长期记忆

## 项目概览
- Electron 桌面宠物 + AI 虚拟恋人养成应用（cyber-lover）
- AI 角色名：沈砚之（可自定义），使用智谱 glm-4-flash 模型
- 数据全部 localStorage 持久化

## 养成系统架构
- 6 阶段：初识(0-100) → 熟悉(101-300) → 暧昧(301-600) → 交往(601-1000) → 结婚(1001-2000) → 白头偕老(2001+)
- AI prompt 随阶段动态切换回复边界
- 有记忆系统（50 条上限）、关键词惩罚（4 级）、二次复合路线

## 关键设计决策
- 2026-04-15: 加入关键词惩罚机制，极端关键词（离婚/分手）直接归零好感度，进入二次复合路线。复合期间好感度获取减半，AI 切换为"分手后重新接触"模式。
- 养成系统有两套实现：chat.html 内联版（实际运行）+ js/progression.js（完整版参考），需保持同步

## 已修复 Bug
- 2026-04-15: IIFE 解构时函数名不匹配（isReconciliation vs isReconciling）+ 缺少 applyPenalty 导入，导致 sendMessage 完全无法执行

## 文件结构
- chat.html: 对话窗口 + 养成系统内联实现
- js/progression.js: 养成系统完整版模块
- diary.html: 心情日记 + AI 夸夸
- settings.html: 个人设置（昵称/生日/星座/理想型）
- index.html: 桌面宠物窗口（无边框透明置顶）
- main.js: Electron 主进程窗口管理
