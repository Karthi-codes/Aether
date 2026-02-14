// Company location - Salem New Bus Stand, Tamil Nadu
export const COMPANY_LOCATION = {
    name: 'AETHER Store - Salem',
    address: 'New Bus Stand, Salem, Tamil Nadu 636001',
    pincode: '636001',
    city: 'Salem',
    state: 'Tamil Nadu',
    coordinates: {
        lat: 11.6643,
        lng: 78.1460
    }
};

// Shipping rates configuration (in INR)
export const SHIPPING_RATES = {
    standard: {
        name: 'Standard Delivery',
        baseRate: 30,      // Base charge in ₹
        perKmRate: 2,      // ₹ per km
        deliveryDays: '5-7 business days',
        icon: '📦'
    },
    express: {
        name: 'Express Delivery',
        baseRate: 50,
        perKmRate: 4,
        deliveryDays: '2-3 business days',
        icon: '🚚'
    },
    overnight: {
        name: 'Overnight Delivery',
        baseRate: 100,
        perKmRate: 8,
        deliveryDays: 'Next business day',
        icon: '✈️'
    }
};

// Major Indian cities with approximate distance from Salem (in km)
// This is a simplified lookup table for pincode-based distance estimation
export const PINCODE_DISTANCE_MAP: { [prefix: string]: { city: string; distance: number } } = {
    // Tamil Nadu (close to Salem)
    '636': { city: 'Salem', distance: 0 },
    '637': { city: 'Salem Rural', distance: 25 },
    '638': { city: 'Erode', distance: 60 },
    '639': { city: 'Karur', distance: 80 },
    '641': { city: 'Coimbatore', distance: 160 },
    '642': { city: 'Tirupur', distance: 120 },
    '600': { city: 'Chennai', distance: 340 },
    '601': { city: 'Chennai', distance: 340 },
    '602': { city: 'Chennai', distance: 340 },
    '603': { city: 'Kanchipuram', distance: 300 },
    '604': { city: 'Vellore', distance: 200 },
    '621': { city: 'Trichy', distance: 150 },
    '620': { city: 'Trichy', distance: 150 },
    '625': { city: 'Madurai', distance: 250 },
    '627': { city: 'Tirunelveli', distance: 400 },
    '628': { city: 'Tuticorin', distance: 420 },
    '629': { city: 'Kanyakumari', distance: 500 },
    '643': { city: 'Ooty', distance: 180 },
    '606': { city: 'Tiruvannamalai', distance: 140 },
    '607': { city: 'Villupuram', distance: 200 },
    '605': { city: 'Pondicherry', distance: 250 },

    // Karnataka
    '560': { city: 'Bangalore', distance: 220 },
    '561': { city: 'Bangalore Rural', distance: 230 },
    '570': { city: 'Mysore', distance: 280 },
    '580': { city: 'Hubli', distance: 450 },
    '590': { city: 'Belgaum', distance: 550 },

    // Kerala
    '670': { city: 'Kozhikode', distance: 300 },
    '680': { city: 'Thrissur', distance: 320 },
    '682': { city: 'Kochi', distance: 380 },
    '690': { city: 'Kollam', distance: 450 },
    '695': { city: 'Thiruvananthapuram', distance: 500 },

    // Andhra Pradesh / Telangana
    '500': { city: 'Hyderabad', distance: 550 },
    '501': { city: 'Hyderabad', distance: 550 },
    '530': { city: 'Visakhapatnam', distance: 850 },
    '520': { city: 'Vijayawada', distance: 650 },
    '516': { city: 'Kadapa', distance: 400 },
    '517': { city: 'Tirupati', distance: 350 },

    // Maharashtra
    '400': { city: 'Mumbai', distance: 1050 },
    '411': { city: 'Pune', distance: 900 },
    '440': { city: 'Nagpur', distance: 1100 },

    // Gujarat
    '380': { city: 'Ahmedabad', distance: 1300 },
    '395': { city: 'Surat', distance: 1200 },

    // Delhi NCR
    '110': { city: 'Delhi', distance: 2000 },
    '120': { city: 'Ghaziabad', distance: 2000 },
    '121': { city: 'Faridabad', distance: 2010 },
    '122': { city: 'Gurugram', distance: 2020 },
    '201': { city: 'Noida', distance: 2015 },

    // Uttar Pradesh
    '226': { city: 'Lucknow', distance: 1700 },
    '208': { city: 'Kanpur', distance: 1600 },
    '221': { city: 'Varanasi', distance: 1700 },
    '211': { city: 'Prayagraj', distance: 1650 },

    // Rajasthan
    '302': { city: 'Jaipur', distance: 1800 },
    '313': { city: 'Udaipur', distance: 1500 },
    '342': { city: 'Jodhpur', distance: 1850 },

    // Madhya Pradesh
    '462': { city: 'Bhopal', distance: 1100 },
    '452': { city: 'Indore', distance: 1050 },

    // West Bengal
    '700': { city: 'Kolkata', distance: 1800 },

    // Odisha
    '751': { city: 'Bhubaneswar', distance: 1400 },

    // Bihar
    '800': { city: 'Patna', distance: 1800 },

    // Punjab / Haryana
    '140': { city: 'Chandigarh', distance: 2200 },
    '160': { city: 'Chandigarh', distance: 2200 },
    '141': { city: 'Ludhiana', distance: 2300 },
    '144': { city: 'Amritsar', distance: 2400 },

    // North East
    '781': { city: 'Guwahati', distance: 2500 },

    // Goa
    '403': { city: 'Goa', distance: 650 },
};

/**
 * Calculate approximate distance from Salem based on pincode
 * @param pincode - 6 digit Indian pincode
 * @returns distance in km and city name
 */
export const calculateDistanceFromPincode = (pincode: string): { distance: number; city: string } => {
    if (!pincode || pincode.length < 3) {
        return { distance: 500, city: 'Unknown' }; // Default distance
    }

    // Try 3-digit prefix first
    const prefix3 = pincode.substring(0, 3);
    if (PINCODE_DISTANCE_MAP[prefix3]) {
        return PINCODE_DISTANCE_MAP[prefix3];
    }

    // Try 2-digit prefix for broader regions
    const prefix2 = pincode.substring(0, 2);
    const region2Match = Object.entries(PINCODE_DISTANCE_MAP).find(([key]) => key.startsWith(prefix2));
    if (region2Match) {
        return { distance: region2Match[1].distance + 50, city: region2Match[1].city + ' Region' };
    }

    // Estimate based on first digit (zone)
    const zone = pincode.charAt(0);
    const zoneDistances: { [key: string]: number } = {
        '1': 2100, // Delhi/Haryana/Punjab
        '2': 1700, // UP/Uttarakhand
        '3': 1400, // Rajasthan/Gujarat
        '4': 900,  // Maharashtra/Goa
        '5': 500,  // AP/Telangana/Karnataka
        '6': 200,  // Tamil Nadu/Kerala/Pondicherry
        '7': 1700, // WB/Odisha/NE
        '8': 1800, // Bihar/Jharkhand
        '9': 3000, // Army APO
    };

    return {
        distance: zoneDistances[zone] || 1000,
        city: `Zone ${zone}`
    };
};

/**
 * Calculate shipping cost for a given distance and method
 */
export const calculateShippingCost = (
    distance: number,
    method: 'standard' | 'express' | 'overnight'
): number => {
    const rate = SHIPPING_RATES[method];
    const cost = rate.baseRate + (distance * rate.perKmRate);

    // Cap maximum shipping at reasonable amounts
    const maxCosts = {
        standard: 500,
        express: 1000,
        overnight: 2000
    };

    return Math.min(Math.round(cost), maxCosts[method]);
};

/**
 * Get all shipping options with costs for a given pincode
 */
export const getShippingOptionsForPincode = (pincode: string) => {
    const { distance, city } = calculateDistanceFromPincode(pincode);

    return {
        distance,
        city,
        options: [
            {
                id: 'standard' as const,
                ...SHIPPING_RATES.standard,
                cost: calculateShippingCost(distance, 'standard')
            },
            {
                id: 'express' as const,
                ...SHIPPING_RATES.express,
                cost: calculateShippingCost(distance, 'express')
            },
            {
                id: 'overnight' as const,
                ...SHIPPING_RATES.overnight,
                cost: calculateShippingCost(distance, 'overnight')
            }
        ]
    };
};
