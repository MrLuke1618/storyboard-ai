import { GoogleGenAI, Type } from "@google/genai";
import { AnalyzedShot, VisualStyle } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const scriptAnalysisSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        scene: {
          type: Type.INTEGER,
          description: "The scene number."
        },
        shot: {
          type: Type.INTEGER,
          description: "The shot number within the scene."
        },
        description: {
          type: Type.STRING,
          description: "A vivid, one-sentence visual description of the shot, including characters, action, and setting. This will be used to generate an image."
        },
        shotType: {
          type: Type.STRING,
          description: "The suggested camera shot type (e.g., 'WIDE SHOT', 'MEDIUM SHOT', 'CLOSE UP', 'ESTABLISHING SHOT')."
        },
        dialogue: {
          type: Type.STRING,
          description: "Any dialogue spoken during this shot. If none, return an empty string."
        },
        duration: {
          type: Type.INTEGER,
          description: "An estimated duration of the shot in seconds, based on the action and dialogue."
        }
      },
      required: ["scene", "shot", "description", "shotType", "dialogue", "duration"]
    }
};

export async function analyzeScript(scriptText: string): Promise<AnalyzedShot[]> {
    const systemInstruction = "You are an expert script analyst and assistant director. Your task is to break down a film script into a detailed shot list suitable for storyboarding. Analyze the provided script and return a JSON array of shots. Each shot must have a scene number, shot number, a visual description for image generation, a shot type, any dialogue, and an estimated duration in seconds.";

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Here is the script:\n\n---\n${scriptText}\n---`,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: scriptAnalysisSchema,
                temperature: 0.2,
            },
        });

        const jsonText = response.text.trim();
        const shots: AnalyzedShot[] = JSON.parse(jsonText);
        return shots;
    } catch (error) {
        console.error("Error analyzing script:", error);
        throw new Error("Failed to analyze script. The model may have returned an invalid format.");
    }
}


export async function generateImageForShot(shotDescription: string, style: VisualStyle): Promise<string> {
    const stylePromptMap = {
        'Cinematic': 'cinematic film still, photorealistic, dramatic lighting, high detail, 8k, rule of thirds composition',
        'Film Noir': 'black and white, high contrast, film noir style, dramatic shadows, 1940s detective movie aesthetic, deep focus',
        'Technicolor': 'vibrant saturated colors, classic technicolor film style, lush and rich tones, 1950s Hollywood movie aesthetic',
        'Indie / Gritty': 'gritty realism, desaturated colors, natural lighting, handheld camera feel, documentary style, shallow depth of field',
    };

    const fullPrompt = `${stylePromptMap[style]}, ${shotDescription}`;

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
              numberOfImages: 1,
              aspectRatio: '16:9',
              outputMimeType: 'image/jpeg',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating image:", error);
        // Return a placeholder on failure
        return `https://picsum.photos/seed/${encodeURIComponent(shotDescription)}/1280/720`;
    }
}
