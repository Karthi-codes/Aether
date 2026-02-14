export interface StyleItem {
    id: string;
    name: string;
    img: string;
    type: 'shirt' | 'pant' | 'dress';
    category: 'men' | 'women';
    brand?: string;
    price?: number;
}

export interface BrandProfile {
    name: string;
    logo: string;
    coverImage: string;
    color: string;
    products: StyleItem[]; // Products specific to this brand for the spotlight
}



export const wardrobeItems: StyleItem[] = [
    // Men's Tops
    {
        id: 'm-top-1',
        name: 'Classic White Shirt',
        img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        type: 'shirt',
        category: 'men'
    },
    {
        id: 'm-top-2',
        name: 'Denim Jacket',
        img: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        type: 'shirt',
        category: 'men'
    },
    {
        id: 'm-top-3',
        name: 'Black Graphic Tee',
        img: 'https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        type: 'shirt',
        category: 'men'
    },
    {
        id: 'm-top-4',
        name: 'Beige Sweater',
        img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        type: 'shirt',
        category: 'men'
    },

    // Men's Bottoms
    {
        id: 'm-bot-1',
        name: 'Blue Slim Jeans',
        img: 'https://images.unsplash.com/photo-1542272617-08f086303294?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        type: 'pant',
        category: 'men'
    },
    {
        id: 'm-bot-2',
        name: 'Chino Shorts',
        img: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        type: 'pant',
        category: 'men'
    },
    {
        id: 'm-bot-3',
        name: 'Black Cargo Pants',
        img: 'https://images.unsplash.com/photo-1517445312882-56363c4c9d54?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        type: 'pant',
        category: 'men'
    },

    // Women's Tops
    {
        id: 'w-top-1',
        name: 'Floral Blouse',
        img: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        type: 'shirt',
        category: 'women'
    },
    {
        id: 'w-top-2',
        name: 'White Crop Top',
        img: 'https://images.unsplash.com/photo-1529139574466-a302d2052574?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        type: 'shirt',
        category: 'women'
    },
    {
        id: 'w-top-3',
        name: 'Leather Jacket',
        img: 'https://images.unsplash.com/photo-1551028919-ac76c9085918?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        type: 'shirt',
        category: 'women'
    },

    // Women's Bottoms
    {
        id: 'w-bot-1',
        name: 'High Waist Jeans',
        img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        type: 'pant',
        category: 'women'
    },
    {
        id: 'w-bot-2',
        name: 'Pleated Skirt',
        img: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        type: 'pant',
        category: 'women'
    },
];
