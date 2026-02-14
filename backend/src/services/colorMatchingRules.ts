// Rule-based color matching logic for outfit suggestions
// These rules define which colors complement each other

export interface ColorMatch {
    color: string;
    matchingColors: string[];
}

// Color matching rules - defines complementary colors
export const colorMatchingRules: ColorMatch[] = [
    {
        color: 'black',
        matchingColors: ['white', 'cream', 'grey', 'navy', 'camel', 'light blue', 'sand', 'oatmeal']
    },
    {
        color: 'white',
        matchingColors: ['black', 'navy', 'olive', 'charcoal', 'forest green', 'burgundy', 'terracotta']
    },
    {
        color: 'navy',
        matchingColors: ['white', 'cream', 'light blue', 'sand', 'camel', 'grey', 'oatmeal']
    },
    {
        color: 'grey',
        matchingColors: ['black', 'white', 'navy', 'burgundy', 'cream', 'forest green']
    },
    {
        color: 'charcoal',
        matchingColors: ['white', 'oatmeal', 'cream', 'forest green', 'light blue']
    },
    {
        color: 'olive',
        matchingColors: ['black', 'white', 'stone', 'cream', 'sand', 'camel']
    },
    {
        color: 'stone',
        matchingColors: ['black', 'olive', 'navy', 'white', 'charcoal']
    },
    {
        color: 'cream',
        matchingColors: ['black', 'navy', 'brown', 'terracotta', 'burgundy', 'forest green', 'charcoal']
    },
    {
        color: 'oatmeal',
        matchingColors: ['black', 'charcoal', 'forest green', 'navy', 'burgundy']
    },
    {
        color: 'camel',
        matchingColors: ['black', 'navy', 'white', 'grey', 'cream']
    },
    {
        color: 'sand',
        matchingColors: ['navy', 'black', 'white', 'olive', 'charcoal']
    },
    {
        color: 'light blue',
        matchingColors: ['white', 'navy', 'black', 'grey', 'cream']
    },
    {
        color: 'forest green',
        matchingColors: ['white', 'cream', 'oatmeal', 'black', 'grey']
    },
    {
        color: 'burgundy',
        matchingColors: ['grey', 'white', 'cream', 'oatmeal', 'black', 'navy']
    },
    {
        color: 'terracotta',
        matchingColors: ['cream', 'white', 'black', 'navy', 'ivory']
    },
    {
        color: 'champagne',
        matchingColors: ['black', 'navy', 'charcoal', 'burgundy']
    },
    {
        color: 'blush',
        matchingColors: ['black', 'navy', 'grey', 'white', 'cream']
    },
    {
        color: 'emerald',
        matchingColors: ['black', 'white', 'cream', 'gold', 'champagne']
    },
    {
        color: 'tan',
        matchingColors: ['black', 'white', 'navy', 'cream', 'olive']
    },
    {
        color: 'ivory',
        matchingColors: ['black', 'navy', 'terracotta', 'burgundy', 'forest green']
    },
    {
        color: 'rust',
        matchingColors: ['black', 'cream', 'white', 'navy', 'oatmeal']
    }
];

/**
 * Get matching colors for a given color
 * @param color - The color to find matches for
 * @returns Array of matching color names (lowercase)
 */
export function getMatchingColors(color: string): string[] {
    const normalizedColor = color.toLowerCase().trim();

    // Find exact match
    const rule = colorMatchingRules.find(r => r.color === normalizedColor);
    if (rule) {
        return rule.matchingColors;
    }

    // Check if the color is in any matching list (reverse lookup)
    const reverseMatches: string[] = [];
    colorMatchingRules.forEach(r => {
        if (r.matchingColors.includes(normalizedColor)) {
            reverseMatches.push(r.color);
        }
    });

    if (reverseMatches.length > 0) {
        return reverseMatches;
    }

    // Default neutral matches for unknown colors
    return ['black', 'white', 'grey', 'navy'];
}

/**
 * Check if two colors are a good match
 * @param color1 - First color
 * @param color2 - Second color
 * @returns boolean indicating if colors match well
 */
export function colorsMatch(color1: string, color2: string): boolean {
    const normalized1 = color1.toLowerCase().trim();
    const normalized2 = color2.toLowerCase().trim();

    // Same color always matches
    if (normalized1 === normalized2) return true;

    // Check if color2 is in color1's matching list
    const matches1 = getMatchingColors(normalized1);
    if (matches1.includes(normalized2)) return true;

    // Check reverse
    const matches2 = getMatchingColors(normalized2);
    if (matches2.includes(normalized1)) return true;

    return false;
}
