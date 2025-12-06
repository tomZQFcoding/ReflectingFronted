import { FrameworkType, FrameworkConfig } from './types';

export const FRAMEWORKS: Record<FrameworkType, FrameworkConfig> = {
  [FrameworkType.DAILY]: {
    id: FrameworkType.DAILY,
    label: "每日复盘",
    description: "通过简单的三个维度，快速回顾一天，清空思绪。",
    prompts: [
      { key: 'highlight', label: "今日高光 (Highlight)", placeholder: "记录一件今天发生的小确幸，或者让你有成就感的事...", minHeight: "h-24" },
      { key: 'struggle', label: "遇到的挑战 (Challenge)", placeholder: "今天什么事情让你感到受阻或压力？", minHeight: "h-24" },
      { key: 'learning', label: "新的认知 (Learning)", placeholder: "学到了什么新技能，或者有什么新的感悟？", minHeight: "h-24" }
    ]
  },
  [FrameworkType.KPT]: {
    id: FrameworkType.KPT,
    label: "KPT 模型",
    description: "Keep, Problem, Try。非常适合项目阶段性复盘。",
    prompts: [
      { key: 'keep', label: "保持 (Keep)", placeholder: "哪些做得好？需要继续保持的行为或策略...", minHeight: "h-24" },
      { key: 'problem', label: "问题 (Problem)", placeholder: "遇到了什么问题？客观存在的困难...", minHeight: "h-24" },
      { key: 'try', label: "尝试 (Try)", placeholder: "下一步计划怎么做？具体的行动方案...", minHeight: "h-24" }
    ]
  },
  [FrameworkType.GRAI]: {
    id: FrameworkType.GRAI,
    label: "GRAI 复盘法",
    description: "Goal, Result, Analysis, Insight。深度逻辑分析模型。",
    prompts: [
      { key: 'goal', label: "回顾目标 (Goal)", placeholder: "当初的目的是什么？想要达成的结果是什么？", minHeight: "h-20" },
      { key: 'result', label: "评估结果 (Result)", placeholder: "实际发生了什么？与目标相比有哪些亮点或不足？", minHeight: "h-20" },
      { key: 'analysis', label: "分析原因 (Analysis)", placeholder: "为什么会这样？主观原因和客观原因分别是什么？", minHeight: "h-32" },
      { key: 'insight', label: "总结规律 (Insight)", placeholder: "我们从中学到了什么？也就是我们的“长见识”。", minHeight: "h-24" }
    ]
  },
  [FrameworkType.FOUR_LS]: {
    id: FrameworkType.FOUR_LS,
    label: "4Ls 模型",
    description: "Liked, Learned, Lacked, Longed for。更侧重情感与体验的敏捷复盘。",
    prompts: [
      { key: 'liked', label: "喜欢的 (Liked)", placeholder: "无论大小，今天有哪些让你感到开心或满意的事？", minHeight: "h-24" },
      { key: 'learned', label: "学到的 (Learned)", placeholder: "学到了什么新知识、新技能或新教训？", minHeight: "h-24" },
      { key: 'lacked', label: "缺少的 (Lacked)", placeholder: "原本可以做得更好的是什么？缺了什么资源或能力？", minHeight: "h-24" },
      { key: 'longed_for', label: "渴望的 (Longed For)", placeholder: "你希望未来发生什么？或者渴望拥有什么？", minHeight: "h-24" }
    ]
  },
  [FrameworkType.SWOT]: {
    id: FrameworkType.SWOT,
    label: "SWOT 分析",
    description: "Strengths, Weaknesses, Opportunities, Threats。战略决策与职业规划神器。",
    prompts: [
      { key: 'strengths', label: "优势 (Strengths)", placeholder: "你现在的核心竞争力或资源是什么？做得比别人好的地方？", minHeight: "h-24" },
      { key: 'weaknesses', label: "劣势 (Weaknesses)", placeholder: "目前的短板、瓶颈或资源限制在哪里？", minHeight: "h-24" },
      { key: 'opportunities', label: "机会 (Opportunities)", placeholder: "外部环境有哪些有利因素？有哪些未被满足的需求？", minHeight: "h-24" },
      { key: 'threats', label: "威胁 (Threats)", placeholder: "面临哪些外部风险？竞争对手或环境变化带来了什么压力？", minHeight: "h-24" }
    ]
  },
  [FrameworkType.FREEFORM]: {
    id: FrameworkType.FREEFORM,
    label: "自由书写",
    description: "无结构的自由表达，捕捉当下的灵感与情绪。",
    prompts: [
      { key: 'content', label: "此刻的想法", placeholder: "不要停，写下你脑海中浮现的一切...", minHeight: "h-80" }
    ]
  }
};

export const QUOTES = [
  { text: "我们无法从经验中学习，我们只能从对经验的反思中学习。", author: "约翰·杜威" },
  { text: "未经审视的人生不值得过。", author: "苏格拉底" },
  { text: "在这个世界上，没有所谓的失败，只有反馈。", author: "NLP前提假设" },
  { text: "人的一生，就是不断发现自我、重塑自我的过程。", author: "荣格" },
  { text: "如果你想攀登高峰，切莫把彩虹当作梯子。", author: "西彦" },
  { text: "种一棵树最好的时间是十年前，其次是现在。", author: "丹比萨·莫约" },
  { text: "复盘不是为了责备过去的自己，而是为了赋能未来的自己。", author: "ReflectAI" },
  { text: "真正的发现之旅不在于寻找新的景观，而在于拥有新的眼光。", author: "马塞尔·普鲁斯特" }
];
