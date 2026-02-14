import mongoose from 'mongoose';
import UsedDiscount from '../models/UsedDiscount';
import ScratchCard from '../models/ScratchCard';

// Available discount percentages for scratch cards (smaller amounts: 2-5%)
const DISCOUNT_OPTIONS = [2, 3, 4, 5];

// Minimum order amount to qualify for scratch card
export const MIN_ORDER_FOR_SCRATCH_CARD = 100;

// Scratch card validity in days
const SCRATCH_CARD_VALIDITY_DAYS = 30;

/**
 * Generate a non-repeating discount percentage for a user
 * Tracks previously used discounts to avoid repetition
 */
export async function generateNonRepeatingDiscount(userId: string): Promise<number> {
    try {
        // Get discounts used by this user in the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const usedDiscounts = await UsedDiscount.find({
            userId: new mongoose.Types.ObjectId(userId),
            usedAt: { $gte: sixMonthsAgo },
            source: 'scratch_card'
        }).select('discountValue');

        const usedValues = new Set(usedDiscounts.map(d => d.discountValue));

        // Filter out used discounts
        const availableDiscounts = DISCOUNT_OPTIONS.filter(d => !usedValues.has(d));

        // If all discounts have been used, reset and use all options
        const discountPool = availableDiscounts.length > 0 ? availableDiscounts : DISCOUNT_OPTIONS;

        // Random selection from available pool
        const randomIndex = Math.floor(Math.random() * discountPool.length);
        return discountPool[randomIndex];
    } catch (error) {
        console.error('Error generating non-repeating discount:', error);
        // Fallback to random discount
        return DISCOUNT_OPTIONS[Math.floor(Math.random() * DISCOUNT_OPTIONS.length)];
    }
}

/**
 * Create a scratch card for a user after successful order
 */
export async function createScratchCard(
    userId: string,
    orderId: string,
    orderAmount: number
): Promise<typeof ScratchCard.prototype | null> {
    try {
        // Only create scratch card for orders above minimum
        if (orderAmount < MIN_ORDER_FOR_SCRATCH_CARD) {
            return null;
        }

        const discountPercentage = await generateNonRepeatingDiscount(userId);

        // Calculate the discount amount (capped at 50% of order value)
        const maxDiscount = orderAmount * 0.5;
        const calculatedDiscount = (orderAmount * discountPercentage) / 100;
        const discountAmount = Math.min(calculatedDiscount, maxDiscount);

        // Set expiry date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + SCRATCH_CARD_VALIDITY_DAYS);

        const scratchCard = new ScratchCard({
            userId: new mongoose.Types.ObjectId(userId),
            orderId: new mongoose.Types.ObjectId(orderId),
            orderAmount,
            discountPercentage,
            discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimals
            isScratched: false,
            isRedeemed: false,
            expiresAt
        });

        await scratchCard.save();
        return scratchCard;
    } catch (error) {
        console.error('Error creating scratch card:', error);
        return null;
    }
}



/**
 * Record a used discount for a user
 */
export async function recordUsedDiscount(
    userId: string,
    discountValue: number,
    source: 'scratch_card' | 'promo_code' | 'combo'
): Promise<void> {
    try {
        const usedDiscount = new UsedDiscount({
            userId: new mongoose.Types.ObjectId(userId),
            discountValue,
            source
        });
        await usedDiscount.save();
    } catch (error) {
        console.error('Error recording used discount:', error);
    }
}
