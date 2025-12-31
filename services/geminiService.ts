
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzePoster(base64Image: string): Promise<{ text: string; division: string }> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1],
            },
          },
          {
            text: `1. Extract all text from this poster (Title, Date, Topic). 
            2. Based on the content, categorize this poster into EXACTLY one of these divisions: 'Development', 'Cyber', 'Data Science', 'Capacity Building', or 'General/Events'.
            Return the result in JSON format with keys 'text' and 'division'.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      text: result.text || "No text extracted.",
      division: result.division || "General/Events"
    };
  }

  async generateRemasteredPoster(extractedText: string, division: string, userInstructions: string = ''): Promise<string> {
    const divisionStyles: Record<string, string> = {
      'Development': "Design DNA: Structural grid-based layouts, subtle glowing syntax highlights (blues/pinks), minimalist code-inspired borders, and monospaced accent fonts. High-tech engineering vibe.",
      'Cyber': "Design DNA: Dark security aesthetic, terminal-green or warning-red accents, glitch-textured backgrounds, aggressive geometric tech shapes, and encrypted data-stream overlays.",
      'Data Science': "Design DNA: Sophisticated abstract data-point clouds, neural network visualizations, elegant translucent layers, mathematical curves, and a clean, logical 'Big Data' feel.",
      'Capacity Building': "Design DNA: Approachable yet professional 'Growth' aesthetic. Use light-path effects, community-focused iconography, warm professional tones, and a very clear educational hierarchy.",
      'General/Events': "Design DNA: Cinematic spotlights, high-energy dynamic gradients, bold oversized hero typography, and a festive yet futuristic club event vibe."
    };

    const styleContext = divisionStyles[division] || divisionStyles['General/Events'];
    const customContext = userInstructions ? `User's specific creative direction: "${userInstructions}"` : "";

    const prompt = `Task: Create a world-class 2025 social media poster for the CSEC club.
    
    FACTUAL CONTENT: ${extractedText}
    TARGET DIVISION: ${division}
    ${styleContext}
    ${customContext}
    
    Requirements:
    - 2025 professional tech club aesthetic.
    - Balanced, high-quality typography.
    - No clutter. Clean, striking visuals.
    - If it's an opening event, make it feel like a grand reveal. If it's a closing event, make it feel like a celebratory completion.
    - Ensure all dates and titles from the content are clearly visible but beautifully integrated into the tech theme.`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt }
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4"
        }
      }
    });

    let imageUrl = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) throw new Error("Failed to generate image.");
    return imageUrl;
  }
}
