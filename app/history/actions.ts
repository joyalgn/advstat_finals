"use server";

import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { requireAuthenticatedUser } from "../auth/session";

type AnalysisMethod = "Simple Linear Regression" | "Hypothesis Testing";

export interface ClearHistoryResult {
  success: boolean;
  message: string;
}

export interface SaveAnalysisHistoryResult {
  success: boolean;
  message: string;
}

export async function saveAnalysisHistory(
  method: AnalysisMethod,
  inputData: Prisma.InputJsonValue,
  resultData: Prisma.InputJsonValue,
): Promise<SaveAnalysisHistoryResult> {
  if (method !== "Simple Linear Regression" && method !== "Hypothesis Testing") {
    return { success: false, message: "This analysis method cannot be saved to history." };
  }
  const serializedInput = JSON.stringify(inputData);
  const serializedResult = JSON.stringify(resultData);
  if (!serializedInput || !serializedResult || serializedInput.length + serializedResult.length > 80_000) {
    return { success: false, message: "This analysis is too large to save to history." };
  }

  const user = await requireAuthenticatedUser();
  try {
    await prisma.analysisHistory.create({
      data: { userId: user.id, method, inputData, resultData },
    });
    return { success: true, message: "Analysis saved to history." };
  } catch (error) {
    console.error("Analysis history save failed", error);
    return { success: false, message: "Unable to save this analysis to history. Please try again." };
  }
}

export async function clearAllAnalysisHistory(): Promise<ClearHistoryResult> {
  const user = await requireAuthenticatedUser();

  try {
    const result = await prisma.analysisHistory.deleteMany({
      where: { userId: user.id },
    });
    return {
      success: true,
      message: result.count > 0 ? "Your analysis history has been cleared." : "Your analysis history was already empty.",
    };
  } catch (error) {
    console.error("Analysis history deletion failed", error);
    return { success: false, message: "Unable to clear your analysis history right now. Please try again." };
  }
}
