
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SlideAnalysis } from "@/types";

export const regenerateSlide = async (
    apiKey: string,
    originalImage: string | undefined,
    title: string,
    keyData: string[],
    analysis: SlideAnalysis
): Promise<string> => {
    const genAI = new GoogleGenerativeAI(apiKey);

    // 1. Try to use the specialized preview model from the reference code (gemini-3-pro-image-preview)
    // This model likely supports the 'imageConfig' for direct image output.
    let model: any;
    let usedModelName = "gemini-3-pro-image-preview";

    try {
        console.log(`[Regen] Attempting to initialize ${usedModelName}...`);
        model = genAI.getGenerativeModel({
            model: usedModelName,
            // @ts-ignore - bypassing TS for experimental config
            generationConfig: {
                imageConfig: { aspectRatio: "16:9", imageSize: "1K" }
            } as any
        });
    } catch (e) {
        console.warn(`[Regen] Failed to init ${usedModelName}, falling back.`);
    }

    // 2. Fallback to gemini-2.0-flash-exp if the first one fails or isn't available
    if (!model) {
        usedModelName = "gemini-2.0-flash-exp";
        console.log(`[Regen] Falling back to ${usedModelName}`);
        model = genAI.getGenerativeModel({ model: usedModelName });
    }

    const prompt = `
    You are an AI presentation designer.
    Task: Create a high-quality presentation slide image.
    
    Content Requirements:
    - Title: "${title}"
    - Key Points:
    ${keyData.map((k, i) => `  ${i + 1}. ${k}`).join('\n')}
    
    Design Context:
    - Theme: ${analysis.design_context.theme}
    - Fonts: ${analysis.design_context.font_characteristics}
    - Style: Professional, clean, and visually impactful.
    
    Instructions:
    - If an initial image is provided, use it as a layout reference but RE-GENERATE the visual assets and text.
    - The output MUST be a valid image file.
  `;

    const parts: any[] = [{ text: prompt }];

    if (originalImage) {
        const base64Data = originalImage.split(",")[1];
        parts.push({
            inlineData: {
                data: base64Data,
                mimeType: "image/png",
            },
        });
    }

    try {
        console.log(`[Regen] Sending request to ${usedModelName}...`);

        // If the first model fails during generation, we catch it and try the fallback
        try {
            return await executeGeneration(model, parts);
        } catch (primaryError) {
            console.error(`[Regen] Primary model ${usedModelName} failed:`, primaryError);

            if (usedModelName !== "gemini-2.0-flash-exp") {
                console.log("[Regen] Retrying with gemini-2.0-flash-exp...");
                const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
                return await executeGeneration(fallbackModel, parts);
            }
            throw primaryError;
        }

    } catch (e) {
        console.error("[Regen] Final Error:", e);
        throw e;
    }
};

async function executeGeneration(model: any, parts: any[]): Promise<string> {
    const result = await model.generateContent(parts);
    const response = await result.response;
    console.log("[Regen] Received response:", response);

    const partsResponse = response.candidates?.[0]?.content?.parts;
    if (partsResponse) {
        for (const part of partsResponse) {
            if (part.inlineData && part.inlineData.mimeType.startsWith("image")) {
                console.log("[Regen] Image found!");
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }

    throw new Error("AI generated a response but no image was found. The model might have returned text only: " + JSON.stringify(partsResponse));
}
