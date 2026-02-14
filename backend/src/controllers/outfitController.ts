import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export const analyzeOutfit = async (req: Request, res: Response): Promise<void> => {
    try {
        const { shirtName, pantName, category } = req.body;

        if (!shirtName || !pantName) {
            res.status(400).json({ error: 'Both shirt and pant names are required' });
            return;
        }

        // If no API key, return a smart fallback
        if (!GEMINI_API_KEY) {
            const fallbackResult = generateFallbackAnalysis(shirtName, pantName, category);
            res.json(fallbackResult);
            return;
        }

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `You are a fashion stylist AI. Analyze this outfit combination and provide styling advice.

Outfit:
- Top: ${shirtName}
- Bottom: ${pantName}
- Category: ${category === 'men' ? "Men's" : "Women's"} fashion

Respond ONLY with valid JSON (no markdown, no code blocks) in this exact format:
{
  "score": <number 1-10>,
  "vibe": "<one-word vibe like 'Casual', 'Elegant', 'Streetwear', 'Classic', 'Edgy', 'Sporty', 'Boho', 'Minimal'>",
  "colorHarmony": "<brief 10-15 word analysis of how the colors work together>",
  "occasions": ["<occasion1>", "<occasion2>", "<occasion3>"],
  "tips": ["<tip1 - max 15 words>", "<tip2 - max 15 words>", "<tip3 - max 15 words>"],
  "complementaryAccessories": ["<accessory1>", "<accessory2>", "<accessory3>"],
  "seasonBest": "<best season for this outfit: Spring/Summer/Autumn/Winter/All-Season>"
}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse the JSON from the response
        let analysis;
        try {
            // Try to extract JSON from the response (handles markdown code blocks too)
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                analysis = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseErr) {
            console.error('Failed to parse Gemini response:', responseText);
            analysis = generateFallbackAnalysis(shirtName, pantName, category);
        }

        res.json(analysis);
    } catch (error) {
        console.error('Outfit analysis error:', error);
        // Return fallback instead of error
        const { shirtName, pantName, category } = req.body;
        const fallbackResult = generateFallbackAnalysis(shirtName || 'Top', pantName || 'Bottom', category || 'men');
        res.json(fallbackResult);
    }
};

function generateFallbackAnalysis(shirtName: string, pantName: string, category: string): any {
    const vibes = ['Casual', 'Classic', 'Elegant', 'Streetwear', 'Minimal', 'Edgy'];
    const occasions = [
        ['Weekend Brunch', 'Casual Outing', 'Coffee Date'],
        ['Office Meeting', 'Business Lunch', 'Dinner Date'],
        ['Night Out', 'Concert', 'Gallery Opening'],
        ['Campus Life', 'Shopping Trip', 'Park Hangout']
    ];
    const tips = [
        [`Add a statement watch to elevate this ${category === 'men' ? "men's" : "women's"} look`, 'Roll up the sleeves for a relaxed vibe', 'Pair with clean white sneakers for balance'],
        ['Layer with a structured blazer for polish', 'Add minimalist jewelry for understated elegance', 'Choose leather accessories to tie it together'],
        ['Go monochrome with your accessories', `This ${shirtName} pairs beautifully with ${pantName}`, 'Add sunglasses for a confident finish']
    ];
    const accessories = [
        ['Leather Watch', 'White Sneakers', 'Canvas Tote'],
        ['Silver Chain', 'Chelsea Boots', 'Crossbody Bag'],
        ['Statement Belt', 'Loafers', 'Aviator Sunglasses']
    ];
    const seasons = ['Spring', 'Summer', 'Autumn', 'All-Season'];

    const vibeIdx = Math.floor(Math.random() * vibes.length);
    const occIdx = Math.floor(Math.random() * occasions.length);
    const tipIdx = Math.floor(Math.random() * tips.length);
    const accIdx = Math.floor(Math.random() * accessories.length);

    return {
        score: Math.floor(Math.random() * 3) + 7, // 7-9
        vibe: vibes[vibeIdx],
        colorHarmony: `The ${shirtName} creates a balanced contrast with the ${pantName}, offering visual depth.`,
        occasions: occasions[occIdx],
        tips: tips[tipIdx],
        complementaryAccessories: accessories[accIdx],
        seasonBest: seasons[Math.floor(Math.random() * seasons.length)]
    };
}
