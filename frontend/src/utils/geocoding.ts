/**
 * Free Geocoding using Nominatim (OpenStreetMap)
 * No API key required - just respect usage limits
 * Limit: 1 request per second, include User-Agent
 */

export interface GeocodingResult {
    lat: number;
    lon: number;
    displayName: string;
    city?: string;
    state?: string;
    country?: string;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Respect rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second

const waitForRateLimit = async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await new Promise(resolve =>
            setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
        );
    }
    lastRequestTime = Date.now();
};

/**
 * Search for a location by address text
 */
export const searchAddress = async (query: string): Promise<GeocodingResult[]> => {
    if (!query || query.trim().length < 3) return [];

    await waitForRateLimit();

    try {
        const response = await fetch(
            `${NOMINATIM_BASE_URL}/search?` + new URLSearchParams({
                q: query,
                format: 'json',
                addressdetails: '1',
                limit: '5',
                countrycodes: 'in' // Focus on India
            }),
            {
                headers: {
                    'User-Agent': 'AETHER-Ecommerce/1.0'
                }
            }
        );

        if (!response.ok) throw new Error('Geocoding failed');

        const data = await response.json();

        return data.map((item: any) => ({
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            displayName: item.display_name,
            city: item.address?.city || item.address?.town || item.address?.village,
            state: item.address?.state,
            country: item.address?.country
        }));
    } catch (error) {
        console.error('Geocoding error:', error);
        return [];
    }
};

/**
 * Get coordinates from a structured address
 */
export const geocodeAddress = async (
    address: string,
    city: string,
    state: string,
    country: string = 'India'
): Promise<GeocodingResult | null> => {
    const query = `${address}, ${city}, ${state}, ${country}`;
    const results = await searchAddress(query);
    return results.length > 0 ? results[0] : null;
};

/**
 * Reverse geocode: coordinates to address
 */
export const reverseGeocode = async (lat: number, lon: number): Promise<GeocodingResult | null> => {
    await waitForRateLimit();

    try {
        const response = await fetch(
            `${NOMINATIM_BASE_URL}/reverse?` + new URLSearchParams({
                lat: lat.toString(),
                lon: lon.toString(),
                format: 'json',
                addressdetails: '1'
            }),
            {
                headers: {
                    'User-Agent': 'AETHER-Ecommerce/1.0'
                }
            }
        );

        if (!response.ok) throw new Error('Reverse geocoding failed');

        const data = await response.json();

        return {
            lat: parseFloat(data.lat),
            lon: parseFloat(data.lon),
            displayName: data.display_name,
            city: data.address?.city || data.address?.town || data.address?.village,
            state: data.address?.state,
            country: data.address?.country
        };
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
};

/**
 * Calculate distance between two points using Haversine formula
 */
export const calculateDistance = (
    lat1: number, lon1: number,
    lat2: number, lon2: number
): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
};
