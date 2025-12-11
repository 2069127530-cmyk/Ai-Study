import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

// Define the expected JSON schema for the model output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    subject: {
      type: Type.STRING,
      description: "The subject of the exam (e.g., 数学, 英语, 物理).",
    },
    estimatedScore: {
      type: Type.NUMBER,
      description: "The estimated score achieved by the student based on the visible marks.",
    },
    totalScore: {
      type: Type.NUMBER,
      description: "The total possible score of the exam.",
    },
    summary: {
      type: Type.STRING,
      description: "A brief, encouraging summary of the student's performance.",
    },
    weaknesses: {
      type: Type.ARRAY,
      description: "List of weak knowledge points identified from mistakes.",
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING, description: "Name of the knowledge point." },
          severity: { type: Type.NUMBER, description: "Severity of the weakness from 0 to 100." },
          description: { type: Type.STRING, description: "Explanation of why this is a weakness." },
        },
        required: ["topic", "severity", "description"],
      },
    },
    plan: {
      type: Type.ARRAY,
      description: "A step-by-step study plan to improve.",
      items: {
        type: Type.OBJECT,
        properties: {
          stage: { type: Type.STRING, description: "Timeframe or stage name (e.g., '第1-3天')." },
          task: { type: Type.STRING, description: "Specific action item." },
          focus: { type: Type.STRING, description: "Key focus area." },
        },
        required: ["stage", "task", "focus"],
      },
    },
    mistakes: {
      type: Type.ARRAY,
      description: "Detailed analysis of specific mistakes found in the image.",
      items: {
        type: Type.OBJECT,
        properties: {
          questionId: { type: Type.STRING, description: "Question number (e.g., 'Q3', '填空题2')." },
          topic: { type: Type.STRING, description: "Related knowledge point." },
          cause: { type: Type.STRING, description: "Likely cause of error (e.g., Calculation error, Concept misunderstanding)." },
          solution: { type: Type.STRING, description: "How to solve it correctly." },
        },
        required: ["questionId", "topic", "cause", "solution"],
      },
    },
  },
  required: ["subject", "estimatedScore", "totalScore", "summary", "weaknesses", "plan", "mistakes"],
};

/**
 * Compresses an image base64 string to reduce payload size.
 * Resizes to max dimension of 1024px and reduces quality to 0.5.
 */
async function compressImage(base64Data: string, mimeType: string): Promise<{ data: string; mimeType: string }> {
  // If not an image (e.g. PDF), return original
  if (!mimeType.startsWith('image/')) {
    return { data: base64Data, mimeType };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Max dimension 1024px to ensure safe payload size (< 500KB usually)
      const MAX_SIZE = 1024;
      if (width > height) {
        if (width > MAX_SIZE) {
          height = Math.round(height * (MAX_SIZE / width));
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width = Math.round(width * (MAX_SIZE / height));
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback to original if context creation fails
        resolve({ data: base64Data, mimeType });
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      // Convert to JPEG with 0.5 quality
      const newDataUrl = canvas.toDataURL('image/jpeg', 0.5);
      resolve({ 
        data: newDataUrl.split(',')[1], 
        mimeType: 'image/jpeg' 
      });
    };

    img.onerror = () => {
      console.warn("Image compression failed, utilizing original data.");
      resolve({ data: base64Data, mimeType });
    };

    img.src = `data:${mimeType};base64,${base64Data}`;
  });
}

export const analyzeExamPaper = async (base64Image: string, mimeType: string): Promise<AnalysisResult> => {
  try {
    const apiKey = process.env.API_KEY;
    
    // Debug logging for troubleshooting deployment issues
    if (!apiKey) {
        console.error("Gemini Service: API Key is missing from process.env");
    } else {
        // Log masked key to verify it is loaded correctly (e.g. AIzaSy...)
        console.log(`Gemini Service: API Key loaded (starts with ${apiKey.substring(0, 8)}...)`);
    }

    if (!apiKey) {
      throw new Error("API Key is missing. Please check your environment configuration.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Compress image to avoid "Rpc failed due to xhr error" (payload too large)
    const processed = await compressImage(base64Image, mimeType);

    // Using gemini-2.5-flash for speed and multimodal capabilities
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: processed.mimeType,
              data: processed.data,
            },
          },
          {
            text: `你是一位资深的教育专家。请分析这张上传的试卷或答题卡图片。
            1. 识别科目、估算分数。
            2. 仔细找出其中的错题，分析错误原因。
            3. 归纳出学生的薄弱知识点，并给出严重程度评分（0-100）。
            4. 制定一个切实可行的提分计划。
            
            请务必以客观、鼓励的语气输出。如果无法看清具体分数，请根据错题数量估算一个大概的分数。`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4, // Lower temperature for more analytical/consistent results
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated from AI.");
    }

    const data = JSON.parse(text) as AnalysisResult;
    return data;

  } catch (error) {
    console.error("Error analyzing exam paper:", error);
    throw error;
  }
};