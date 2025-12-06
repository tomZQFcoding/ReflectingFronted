import { FrameworkType, AIAnalysisResult, ReviewEntry, WeeklyAnalysisResult, AIModel } from "../types";
import * as openRouterService from "./openRouterService";
import * as zhipuAiService from "./zhipuAiService";

/**
 * 统一的AI服务接口
 * 根据选择的模型调用对应的服务
 */
export const analyzeEntry = async (
  model: AIModel,
  framework: FrameworkType,
  content: Record<string, string>
): Promise<AIAnalysisResult> => {
  switch (model) {
    case AIModel.OPENROUTER_OLMO:
      return await openRouterService.analyzeEntry(framework, content);
    case AIModel.ZHIPU_GLM45:
      return await zhipuAiService.analyzeEntry(framework, content);
    default:
      throw new Error(`Unsupported AI model: ${model}`);
  }
};

export const generateWeeklyReport = async (
  model: AIModel,
  entries: ReviewEntry[]
): Promise<WeeklyAnalysisResult> => {
  switch (model) {
    case AIModel.OPENROUTER_OLMO:
      return await openRouterService.generateWeeklyReport(entries);
    case AIModel.ZHIPU_GLM45:
      return await zhipuAiService.generateWeeklyReport(entries);
    default:
      throw new Error(`Unsupported AI model: ${model}`);
  }
};

/**
 * 检查模型API Key是否配置
 */
export const checkModelApiKey = (model: AIModel): boolean => {
  switch (model) {
    case AIModel.OPENROUTER_OLMO:
      const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.OPENROUTER_API_KEY;
      return !!openRouterKey;
    case AIModel.ZHIPU_GLM45:
      const zhipuKey = import.meta.env.VITE_ZHIPU_API_KEY || import.meta.env.ZHIPU_API_KEY;
      return !!zhipuKey;
    default:
      return false;
  }
};

