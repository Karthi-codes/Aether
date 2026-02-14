
import type { Product } from '../types';

export const products: Product[] = [
    // --- WOMEN'S CLOTHING ---
    {
        id: 'w-c-1',
        name: 'Elegant Evening Gown',
        price: 15999,
        category: 'Women',
        subCategory: 'Dresses',
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80',
        description: 'A stunning evening gown perfect for formal occasions.',
        sizes: ['S', 'M', 'L'],
        colors: ['Red', 'Black', 'Blue'],
        inStock: true,
        productType: 'other',
        stock: 0
    },
    {
        id: 'w-c-2',
        name: 'Summer Floral Dress',
        price: 4999,
        category: 'Women',
        subCategory: 'Dresses',
        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80',
        description: 'Light and breezy floral dress for summer days.',
        sizes: ['XS', 'S', 'M', 'L'],
        colors: ['White', 'Yellow'],
        inStock: true,
        productType: 'other',
        stock: 0
    },
    {
        id: 'w-c-3',
        name: 'Silk Blouse',
        price: 3500,
        category: 'Women',
        subCategory: 'Tops',
        image: 'https://images.unsplash.com/photo-1563178406-4cdc2923acce?auto=format&fit=crop&q=80',
        description: 'Premium silk blouse with a relaxed fit.',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Beige', 'White'],
        inStock: true,
        productType: 'shirt',
        stock: 0
    },
    {
        id: 'w-c-4',
        name: 'Pleated Midi Skirt',
        price: 2999,
        category: 'Women',
        subCategory: 'Skirts',
        image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&q=80',
        description: 'Elegant pleated skirt suitable for office or casual wear.',
        sizes: ['S', 'M', 'L'],
        colors: ['Green', 'Black'],
        inStock: true,
        productType: 'other',
        stock: 0
    },
    {
        id: 'w-c-5',
        name: 'Tailored Trousers',
        price: 4500,
        category: 'Women',
        subCategory: 'Pants',
        image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80',
        description: 'Smart tailored trousers for a professional look.',
        sizes: ['28', '30', '32', '34'],
        colors: ['Black', 'Grey', 'Navy'],
        inStock: true,
        productType: 'pant',
        stock: 0
    },
    {
        id: 'w-c-6',
        name: 'Classic Trench Coat',
        price: 12999,
        category: 'Women',
        subCategory: 'Outerwear',
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80',
        description: 'Timeless trench coat that never goes out of style.',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Beige', 'Black'],
        inStock: true,
        productType: 'other',
        stock: 0
    },

    // --- WOMEN'S SHOES ---
    {
        id: 'w-s-1',
        name: 'Classic Pumps',
        price: 5999,
        category: 'Women',
        subCategory: 'Heels',
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80',
        description: 'Elegant pumps perfect for work or evening wear.',
        sizes: ['36', '37', '38', '39', '40'],
        colors: ['Black', 'Nude'],
        inStock: true,
        productType: 'other',
        stock: 0
    },
    {
        id: 'w-s-2',
        name: 'White Leather Trainers',
        price: 6500,
        category: 'Women',
        subCategory: 'Sneakers',
        image: 'https://images.unsplash.com/photo-1560769629-975e13f0c470?auto=format&fit=crop&q=80',
        description: 'Comfortable and stylish white leather sneakers.',
        sizes: ['36', '37', '38', '39', '40'],
        colors: ['White'],
        inStock: true,
        productType: 'other',
        stock: 0
    },
    {
        id: 'w-s-3',
        name: 'Ankle Boots',
        price: 8999,
        category: 'Women',
        subCategory: 'Boots',
        image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&q=80',
        description: 'Chic ankle boots to complete your fall outfit.',
        sizes: ['36', '37', '38', '39'],
        colors: ['Brown', 'Black'],
        inStock: true,
        productType: 'other',
        stock: 0
    },
    {
        id: 'w-s-4',
        name: 'Summer Sandals',
        price: 2999,
        category: 'Women',
        subCategory: 'Sandals',
        image: 'https://images.unsplash.com/photo-1562273138-f46be4ebdf6e?auto=format&fit=crop&q=80',
        description: 'Comfortable sandals for hot summer days.',
        sizes: ['36', '37', '38', '39'],
        colors: ['Tan', 'Gold'],
        inStock: true,
        productType: 'other',
        stock: 0
    },

    // --- WOMEN'S ACCESSORIES ---
    {
        id: 'w-a-1',
        name: 'Leather Tote',
        price: 14500,
        category: 'Women',
        subCategory: 'Bags', // Also matches Accessories -> Bags conceptually, but assigned to Women here as per request context
        image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80',
        description: 'Spacious leather tote for all your essentials.',
        sizes: ['One Size'],
        colors: ['Brown', 'Black'],
        inStock: true,
        productType: 'other',
        stock: 0
    },
    {
        id: 'w-a-2',
        name: 'Gold Hoop Earrings',
        price: 1200,
        category: 'Women',
        subCategory: 'Jewelry',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80',
        description: 'Classic gold hoop earrings.',
        sizes: ['One Size'],
        colors: ['Gold'],
        inStock: true,
        productType: 'other',
        stock: 0
    },
    {
        id: 'w-a-3',
        name: 'Silk Scarf',
        price: 2500,
        category: 'Women',
        subCategory: 'Scarves',
        image: 'https://images.unsplash.com/photo-1584030373081-f37b7bb2fa8e?auto=format&fit=crop&q=80',
        description: 'Luxurious silk scarf with a vibrant print.',
        sizes: ['One Size'],
        colors: ['Multi'],
        inStock: true,
        productType: 'other',
        stock: 0
    },

    // --- MEN'S CLOTHING ---
    {
        id: 'm-c-1',
        name: 'Oxford Shirt',
        price: 4500,
        category: 'Men',
        subCategory: 'Shirts',
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80',
        description: 'Classic Oxford shirt, a wardrobe staple.',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Blue', 'White'],
        inStock: true,
        productType: 'shirt',
        stock: 0
    },
    {
        id: 'm-c-2',
        name: 'Basic Crew Neck Tee',
        price: 1500,
        category: 'Men',
        subCategory: 'T-Shirts',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80',
        description: 'Soft cotton crew neck t-shirt.',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['White', 'Black', 'Grey'],
        inStock: true,
        productType: 'shirt',
        stock: 0
    },
    {
        id: 'm-c-3',
        name: 'Chinos',
        price: 3999,
        category: 'Men',
        subCategory: 'Pants',
        image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80',
        description: 'Versatile chinos suitable for any occasion.',
        sizes: ['30', '32', '34', '36'],
        colors: ['Khaki', 'Navy'],
        inStock: true,
        productType: 'pant',
        stock: 0
    },
    {
        id: 'm-c-4',
        name: 'Denim Jacket',
        price: 6999,
        category: 'Men',
        subCategory: 'Jackets',
        image: 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&q=80',
        description: 'Classic denim jacket with a rugged look.',
        sizes: ['M', 'L', 'XL'],
        colors: ['Blue'],
        inStock: true,
        productType: 'other',
        stock: 0
    },
    {
        id: 'm-c-5',
        name: 'Navy Blue Suit',
        price: 24999,
        category: 'Men',
        subCategory: 'Suits',
        image: 'https://images.unsplash.com/photo-1593032465175-d81f0f53d35b?auto=format&fit=crop&q=80',
        description: 'Sharp navy blue suit for business or formal events.',
        sizes: ['38', '40', '42', '44'],
        colors: ['Navy'],
        inStock: true,
        productType: 'other',
        stock: 0
    },
    {
        id: 'm-c-6',
        name: 'Streetwear Graphic Hoodie',
        price: 3499,
        category: 'Men',
        subCategory: 'Hoodies',
        image: 'https://images.unsplash.com/photo-1556906781-9a412961d289?auto=format&fit=crop&q=80',
        description: 'Comfortable streetwear hoodie with a modern graphic design.',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'Grey'],
        inStock: true,
        productType: 'shirt',
        stock: 0
    },
    {
        id: 'w-c-7',
        name: 'Oversized Cotton Hoodie',
        price: 2999,
        category: 'Women',
        subCategory: 'Hoodies',
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80',
        description: 'Relaxed fit cotton hoodie for maximum comfort.',
        sizes: ['XS', 'S', 'M', 'L'],
        colors: ['Pink', 'White', 'Beige'],
        inStock: true,
        productType: 'shirt',
        stock: 0
    },

    // --- MEN'S SHOES ---
    {
        id: 'm-s-1',
        name: 'Formal Oxford Shoes',
        price: 8999,
        category: 'Men',
        subCategory: 'Formal',
        image: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?auto=format&fit=crop&q=80',
        description: 'Polished leather Oxford shoes.',
        sizes: ['40', '41', '42', '43', '44'],
        colors: ['Black', 'Brown'],
        inStock: true,
        productType: 'other',
        stock: 0
    },
    {
        id: 'm-s-2',
        name: 'Minimalist Sneakers',
        price: 5500,
        category: 'Men',
        subCategory: 'Sneakers',
        image: 'https://images.unsplash.com/photo-1617606002806-94e279b22039?auto=format&fit=crop&q=80',
        description: 'Clean and simple sneakers for everyday wear.',
        sizes: ['40', '41', '42', '43', '44'],
        colors: ['White', 'Grey'],
        inStock: true,
        productType: 'other',
        stock: 0
    },
    {
        id: 'm-s-3',
        name: 'Chelsea Boots',
        price: 10500,
        category: 'Men',
        subCategory: 'Boots',
        image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80',
        description: 'Stylish suede Chelsea boots.',
        sizes: ['40', '41', '42', '43'],
        colors: ['Tan', 'Black'],
        inStock: true,
        productType: 'other',
        stock: 0
    },

    // --- MEN'S ACCESSORIES ---
    {
        id: 'm-a-1',
        name: 'Classic Analog Watch',
        price: 12999,
        category: 'Men',
        subCategory: 'Watches',
        image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80',
        description: 'Timeless analog watch with a leather strap.',
        sizes: ['One Size'],
        colors: ['Black/Silver'],
        inStock: true,
        productType: 'other',
        stock: 0
    },
    {
        id: 'm-a-2',
        name: 'Leather Belt',
        price: 2500,
        category: 'Men',
        subCategory: 'Belts',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80',
        description: 'Durable genuine leather belt.',
        sizes: ['32', '34', '36', '38'],
        colors: ['Brown', 'Black'],
        inStock: true,
        productType: 'other',
        stock: 0
    },
    {
        id: 'm-a-3',
        name: 'Leather Wallet',
        price: 3500,
        category: 'Men',
        subCategory: 'Wallets',
        image: 'https://images.unsplash.com/photo-1627123424574-181ce5171c98?auto=format&fit=crop&q=80',
        description: 'Sleek bifold leather wallet.',
        sizes: ['One Size'],
        colors: ['Black', 'Brown'],
        inStock: true,
        productType: 'other',
        stock: 0
    },

    // --- ACCESSORIES (General) ---
    {
        id: 'a-j-1',
        name: 'Silver Pendant Necklace',
        price: 2200,
        category: 'Accessories',
        subCategory: 'Jewelry',
        image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80',
        description: 'Minimalist silver pendant necklace.',
        sizes: ['One Size'],
        colors: ['Silver'],
        inStock: true,
        productType: 'other',
        stock: 0
    },
    {
        id: 'a-b-1',
        name: 'Canvas Backpack',
        price: 4999,
        category: 'Accessories',
        subCategory: 'Bags',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80', // detailed check later
        description: 'Durable canvas backpack for daily commute.',
        sizes: ['One Size'],
        colors: ['Green', 'Black'],
        inStock: true,
        productType: 'other',
        stock: 0
    },
    {
        id: 'a-o-1',
        name: 'Aviator Sunglasses',
        price: 7500,
        category: 'Accessories',
        subCategory: 'Other', // Matches "Sunglasses" in "Other" category map if we want, or just generic
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80',
        description: 'Classic aviator sunglasses with UV protection.',
        sizes: ['One Size'],
        colors: ['Gold/Green'],
        inStock: true,
        productType: 'other',
        stock: 0
    },
    {
        id: 'a-o-2',
        name: 'Wool Scarf',
        price: 3000,
        category: 'Accessories',
        subCategory: 'Other',
        image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&q=80',
        description: 'Warm wool scarf for winter.',
        sizes: ['One Size'],
        colors: ['Grey'],
        inStock: true,
        productType: 'other',
        stock: 0
    }
];

export const categories = ['All', 'Men', 'Women', 'Accessories', 'Outerwear', 'Footwear', 'Hub'];

export const getProductById = (id: string): Product | undefined => {
    return products.find(p => p.id === id);
};

export const getProductsByCategory = (category: string, subCategory?: string): Product[] => {
    if (category === 'All') return products;
    let filtered = products.filter(p => p.category === category);
    if (subCategory) {
        filtered = filtered.filter(p => p.subCategory === subCategory);
    }
    return filtered;
};

// Get refurbished products only
export const getRefurbishedProducts = (): Product[] => {
    return products.filter(p => p.isRefurbished);
};

// Get products by type for combo detection
export const getProductsByType = (type: 'shirt' | 'pant' | 'other'): Product[] => {
    return products.filter(p => p.productType === type);
};
