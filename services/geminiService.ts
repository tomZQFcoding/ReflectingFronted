import { GoogleGenAI, Type } from "@google/genai";
import { FrameworkType, AIAnalysisResult, ReviewEntry, WeeklyAnalysisResult } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const analyzeEntry = async (
  framework: FrameworkType,
  content: Record<string, string>
): Promise<AIAnalysisResult> => {
  
  if (!apiKey) {
    throw new Error("Gemini API Key is missing.");
  }

  const contentStr = Object.entries(content)
    .map(([key, val]) => `${key.toUpperCase()}: ${val}`)
    .join("\n");

  const prompt = `
    你是一位拥有20年经验的资深复盘教练和心理咨询师。
    请分析用户提交的以下复盘内容（使用了 ${framework} 框架）。
    
    用户输入内容:
    ${contentStr}

    请以JSON格式输出以下内容（所有文本内容必须使用简体中文）：
    1. summary: 一句简练的摘要（不超过30字）。
    2. sentimentScore: 情绪评分，0（非常消极）到 10（非常积极）。
    3. actionItems: 3个具体、可执行的下一步行动建议。建议应简短有力。
    4. keyInsight: 一个深刻的、富有哲学性或战略性的洞察金句。

    请确保语气温暖、专业且具有启发性。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            sentimentScore: { type: Type.NUMBER },
            actionItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            keyInsight: { type: Type.STRING }
          },
          required: ["summary", "sentimentScore", "actionItems", "keyInsight"]
        }
      }
    });

    const text = response.text;
    if (!text) {
        throw new Error("AI 未返回内容");
    }
    
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      summary: "暂时无法进行智能分析。",
      sentimentScore: 5,
      actionItems: ["回顾你的笔记", "稍后再试", "保持深呼吸"],
      keyInsight: "坚持复盘本身就是一种巨大的胜利。"
    };
  }
};

export const generateWeeklyReport = async (entries: ReviewEntry[]): Promise<WeeklyAnalysisResult> => {
    if (!apiKey) throw new Error("API Key Missing");
    if (entries.length === 0) throw new Error("No entries to analyze");

    // Serialize entries for the context window
    const contextData = entries.map(e => `
        日期: ${new Date(e.date).toLocaleDateString()}
        摘要: ${e.aiAnalysis?.summary || '无'}
        评分: ${e.aiAnalysis?.sentimentScore || 0}
        核心洞察: ${e.aiAnalysis?.keyInsight || '无'}
        内容片段: ${JSON.stringify(e.content).slice(0, 300)}...
    `).join("\n---\n");

    const prompt = `
        作为用户的私人成长顾问，请阅读用户过去一段时间的复盘记录（如下），生成一份阶段性总结报告。
        
        复盘记录集合:
        ${contextData}

        请返回 JSON 格式：
        1. dateRange: 分析的日期范围（如 "10月1日 - 10月7日"）。
        2. keywords: 3-5个最能代表这段时间状态的关键词。
        3. emotionalTrend: 描述这段时间的情绪变化趋势（如“先抑后扬”，“持续焦虑但有突破”等）。
        4. growthFocus: 基于用户的问题和复盘，指出用户当前最需要关注的“成长点”或“瓶颈突破口”（100字以内，客观且一针见血）。
        5. suggestion: 针对当前状态，给出一个最重要的战略性建议（50字以内）。
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        dateRange: { type: Type.STRING },
                        keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        emotionalTrend: { type: Type.STRING },
                        growthFocus: { type: Type.STRING },
                        suggestion: { type: Type.STRING }
                    }
                }
            }
        });

        const text = response.text;
        if(!text) throw new Error("No response from AI");
        return JSON.parse(text) as WeeklyAnalysisResult;
    } catch (e) {
        console.error(e);
        throw new Error("周报生成失败");
    }
}
