import { FrameworkType, AIAnalysisResult, ReviewEntry, WeeklyAnalysisResult } from "../types";

const ZHIPU_API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const MODEL_NAME = "glm-4.5-flash";

// 从环境变量获取 API Key
const apiKey = import.meta.env.VITE_ZHIPU_API_KEY || import.meta.env.ZHIPU_API_KEY || "";

interface ZhipuMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ZhipuRequest {
  model: string;
  messages: ZhipuMessage[];
  temperature?: number;
  max_tokens?: number;
  thinking?: {
    type: "enabled" | "disabled";
  };
  response_format?: {
    type: "json_object";
  };
}

interface ZhipuResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 调用智谱AI API
 */
async function callZhipuAI(
  messages: ZhipuMessage[],
  responseFormat: "json" | "text" = "text"
): Promise<string> {
  if (!apiKey) {
    throw new Error("ZhipuAI API Key is missing. Please set VITE_ZHIPU_API_KEY in your environment variables.");
  }

  const requestBody: ZhipuRequest = {
    model: MODEL_NAME,
    messages,
    temperature: 0.7,
    max_tokens: 4096,
    thinking: {
      type: "enabled", // 启用深度思考模式
    },
  };

  // 如果需要 JSON 格式响应，添加 response_format
  if (responseFormat === "json") {
    requestBody.response_format = { type: "json_object" };
    // 在系统消息中明确要求 JSON 格式
    if (messages[0]?.role === "system") {
      messages[0].content += "\n\n请确保你的回复是有效的 JSON 格式，不要包含任何额外的文本或代码块标记。";
    } else {
      messages.unshift({
        role: "system",
        content: "你是一个专业的 AI 助手。请确保你的回复是有效的 JSON 格式，不要包含任何额外的文本或代码块标记。",
      });
    }
  }

  try {
    const response = await fetch(ZHIPU_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || 
        `ZhipuAI API error: ${response.status} ${response.statusText}`
      );
    }

    const data: ZhipuResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error("ZhipuAI API returned no choices");
    }

    const content = data.choices[0].message.content.trim();
    
    // 如果返回的内容被 JSON 代码块包裹，提取 JSON 部分
    if (content.startsWith("```json")) {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return jsonMatch[1].trim();
      }
    } else if (content.startsWith("```")) {
      const jsonMatch = content.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return jsonMatch[1].trim();
      }
    }

    return content;
  } catch (error) {
    console.error("ZhipuAI API Error:", error);
    throw error;
  }
}

/**
 * 分析复盘记录
 */
export const analyzeEntry = async (
  framework: FrameworkType,
  content: Record<string, string>
): Promise<AIAnalysisResult> => {
  if (!apiKey) {
    throw new Error("ZhipuAI API Key is missing.");
  }

  const contentStr = Object.entries(content)
    .map(([key, val]) => `${key.toUpperCase()}: ${val}`)
    .join("\n");

  const systemPrompt = `你是一位拥有20年经验的资深复盘教练和心理咨询师。
你的任务是分析用户的复盘内容，并提供专业的反馈。`;

  const userPrompt = `请分析用户提交的以下复盘内容（使用了 ${framework} 框架）。

用户输入内容:
${contentStr}

请以JSON格式输出以下内容（所有文本内容必须使用简体中文）：
{
  "summary": "一句简练的摘要（不超过30字）",
  "sentimentScore": 情绪评分，0（非常消极）到 10（非常积极）的整数,
  "actionItems": ["3个具体、可执行的下一步行动建议", "建议应简短有力"],
  "keyInsight": "一个深刻的、富有哲学性或战略性的洞察金句"
}

请确保语气温暖、专业且具有启发性。`;

  try {
    const messages: ZhipuMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const responseText = await callZhipuAI(messages, "json");
    const result = JSON.parse(responseText) as AIAnalysisResult;

    // 验证返回的数据结构
    if (!result.summary || typeof result.sentimentScore !== "number" || !Array.isArray(result.actionItems) || !result.keyInsight) {
      throw new Error("Invalid response format from AI");
    }

    return result;
  } catch (error) {
    console.error("ZhipuAI Analysis Error:", error);
    return {
      summary: "暂时无法进行智能分析。",
      sentimentScore: 5,
      actionItems: ["回顾你的笔记", "稍后再试", "保持深呼吸"],
      keyInsight: "坚持复盘本身就是一种巨大的胜利。",
    };
  }
};

/**
 * 生成周报
 */
export const generateWeeklyReport = async (
  entries: ReviewEntry[]
): Promise<WeeklyAnalysisResult> => {
  if (!apiKey) {
    throw new Error("ZhipuAI API Key is missing.");
  }
  if (entries.length === 0) {
    throw new Error("No entries to analyze");
  }

  // 序列化复盘记录
  const contextData = entries
    .map(
      (e) => `
        日期: ${new Date(e.date).toLocaleDateString()}
        摘要: ${e.aiAnalysis?.summary || "无"}
        评分: ${e.aiAnalysis?.sentimentScore || 0}
        核心洞察: ${e.aiAnalysis?.keyInsight || "无"}
        内容片段: ${JSON.stringify(e.content).slice(0, 300)}...
    `
    )
    .join("\n---\n");

  const systemPrompt = `你是一位专业的私人成长顾问，擅长分析用户的复盘记录，并提供深刻的洞察和建议。`;

  const userPrompt = `作为用户的私人成长顾问，请阅读用户过去一段时间的复盘记录（如下），生成一份阶段性总结报告。

复盘记录集合:
${contextData}

请返回 JSON 格式：
{
  "dateRange": "分析的日期范围（如 '10月1日 - 10月7日'）",
  "keywords": ["3-5个最能代表这段时间状态的关键词"],
  "emotionalTrend": "描述这段时间的情绪变化趋势（如'先抑后扬'，'持续焦虑但有突破'等）",
  "growthFocus": "基于用户的问题和复盘，指出用户当前最需要关注的'成长点'或'瓶颈突破口'（100字以内，客观且一针见血）",
  "suggestion": "针对当前状态，给出一个最重要的战略性建议（50字以内）"
}`;

  try {
    const messages: ZhipuMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const responseText = await callZhipuAI(messages, "json");
    const result = JSON.parse(responseText) as WeeklyAnalysisResult;

    // 验证返回的数据结构
    if (
      !result.dateRange ||
      !Array.isArray(result.keywords) ||
      !result.emotionalTrend ||
      !result.growthFocus ||
      !result.suggestion
    ) {
      throw new Error("Invalid response format from AI");
    }

    return result;
  } catch (error) {
    console.error("ZhipuAI Weekly Report Error:", error);
    throw new Error("周报生成失败");
  }
};

